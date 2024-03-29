---
layout: post
title: "It’s Time for a Time-centric Stack: Timeline Abstractions Save Time and Money"
image: assets/images/blog/Blog_Post_Time_Centric.png
author: Brian Godsey
---



When processing and building real-time feature values from event-based data, it
is easy to underestimate the power of tools that are built to understand how
time works. Many software tools can parse and manipulate time-based data, but
the vast majority have little more than convenience functionality for parsing
and doing arithmetic on date-time values. On the other hand, Kaskada has a
built-in, natural understanding of time that just works by default. This
understanding is powerful: it can reduce development time and effort, simplify
deployment and debugging, and reduce the compute and storage resources needed to
support real-time event-based systems.

In this post, I'll discuss some costly pitfalls when building data pipelines
with event-based data. In particular, I will share some anecdotes from my past
experience building SQL-based pipelines, how my team spent considerable time and
money that (in hindsight) could have been avoided, and how Kaskada specifically
could have simplified development and reduced costs. I will get into specifics
below, but the lessons I've learned from using SQL on event data boil down to
this: 

> Event-based data and time values have special properties and natural
> conventions, which lead us to write the same generic logic over and over. This
> time-centric logic—using window functions, time-JOINs, etc—can become
> complicated very quickly, both in code readability and computational
> complexity. Because of this, writing time-centric logic is often inefficient
> and buggy.

The cautionary anecdotes that follow below may qualify as horror stories in some
circles, but I promise that no humans or computing resources were harmed during
the construction of these pipelines or in the mayhem that followed. There was,
however, plenty of time and money lost on a few fronts.


# Case study: calculating daily user statistics and aggregations

In this example, I illustrate how hard it can be to calculate (seemingly)
simple rolling averages when your software tools don't understand time. 

On a project some years ago, our goal was a common one: daily reporting of user
activity, including aggregated statistics like 7-day and 30-day rolling totals
and averages of various types of activity, as well as day-of-week averages, etc.
We were using DBT, a SQL-based tool for developing and scheduling periodic
builds of data pipelines. Some pipeline jobs ran every 30 or 60 minutes, and
others ran as frequently as every 5 minutes—that was as close as we were able to
get to real-time AI, because RTAI is difficult. Importantly, the efficiency of
our data pipeline runs was dependent on the efficiency of the series of SQL
queries that defined the pipeline.

There are many ways to implement rolling averages in SQL, but the simplest
implementation, conceptually, is to use window functions. Window functions, by
design, slide or roll through rows of data and compute sums, averages, and other
statistics. For example, we can calculate a 30-day rolling average with a data
window of 30 rows and a window function called `AVG`. One implication of using
window functions to calculate rolling averages is: there must be a row for every
day. If we don’t have a row of data for every day, then a window of 30 rows of
data will not correspond to 30 days. For example, assume a user has 30 active
days in the last 45 days, and therefore has only 30 rows of data for that time,
with the 15 inactive days corresponding to “missing” rows with no user activity.
Using the window function `AVG` on 30 rows of data will calculate the average
activity values of the 30 active days from the last 45 days, and will “ignore”
the days with zero activity because those rows are missing. Imagine doing this
with an infrequent user who logs in only once per month—you would be calculating
the user’s average for their 30 active days over the last 30 months!

Because of this, if we are going to use window functions to calculate rolling
averages, it is extremely important that a row is present for every day, even if
a user has no activity on that day, because we want to include zero days in the
averages. As a quick side-note: Kaskada doesn’t have this pitfall, because it
understands that a day exists even if there is no activity on that day. We can
specify a “day” or a 30-day window without needing to “manually” build a table
of days. One way to calculate a 30-day rolling average for `activity_value` is:

```fenl
Dataset.activity_value                       # specify the data
| sum(window=sliding(30, daily())) / 30      # sum values and divide
```

We do not need to worry about rows in the table (`Dataset`) being
“missing”—Kaskada understands how time works and by default performs the
calculations that give us our expected results.


## A costly inflection point

Our implementation of window functions for rolling averages worked well at
first, but a month or two later, we noticed that cloud computing costs for
certain pipeline jobs were increasing, slowly at first and then more quickly.
Then, costs tripled in a matter of weeks—it was like we had hit an unforeseen
inflection point, crossing a line from linear cost scaling to exponential. The
bills for our cloud computing resources were going up much faster than our raw
datasets were growing, so we knew there was a problem somewhere.

We investigated, and we identified a few queries in the pipeline that were
responsible for the increasing costs. These guilty queries centered around the
window functions that calculated rolling averages, in addition to some upstream
and downstream queries that either supported or depended on these rolling
averages.

We dug in to find out why.


## How we had “optimized” the window functions

Soon after building the rolling averages into the pipeline, we added some tricks
here or there to make things run more efficiently. Some of these tricks  were
more obvious, and some more clever, but they all saved us time and money
according to the ad-hoc tests we did prior to putting them into production. In
the coming months, however, some of the optimizations we had used to streamline
the window functions stopped saving us money, and some even ended up backfiring
as the dataset scaled up.

Because window functions are typically heavier calculations, they are easy
targets for optimizing overall computation time. In one optimization, we had
introduced an intermediate reference table containing all users and dates in the
dataset. This approach was convenient, as it reduced code redundancy wherever we
needed such a table, it simplified development, and it improved build efficiency
in places where building such a table within a query would have been repeated.


## But the table became too big

Looking at query build times within the data pipeline, it was clear that this
intermediate table of all users and all dates was a significant part of the
problem. One specific issue was that the table had become so large that most
queries and scans of it were slow. Even worse, because SQL engines love to do
massively parallel calculations, our data warehouses (cloud instances) were
trying to pull the whole table into memory while doing aggregations for daily
reporting. The table did not fit into memory, so large amounts of temporary data
was spilling to disk, which is very slow compared with calculations in memory.

We had always been aware that the table could become large—and maintaining a row
for every date and user throughout our entire history was clearly too much. We
didn’t need rows filled with zeros for users who had stopped using our app
months ago. That would lead to a lot of unnecessary data storage and scanning.
So we implemented some simple rules for dropping inactive users from these
tables and calculations. It wasn’t obvious what the exact rules should be, but
there were options. Should we wait for 30 days of inactivity before leaving
those users out of the table? 60 days? Less?

It wasn’t that important to find the “correct” rule for user churn, but
implementing any rule at all added another layer of complexity and logic to the
data pipeline. Even after adding a rule, some of our largest user and date
tables still consisted of over 90% zeros, because the majority of users did not
engage with the app on a daily basis. Even occasional users could keep their
accounts “alive” if they had activity every month or so. Cleverer
implementations were more complex and had other drawbacks, so we stuck with our
simple rules.


## Calculations on a table that’s too big

The problem of the big intermediate table spilling from memory onto disk was
compounded by the fact that window functions often use a lot of memory to begin
with, and we were using them on the big table in multiple places downstream. We
were piling memory-intensive calculations on top of each other, and once they
exceeded the capacity of the compute instances, efficiency took a nosedive and
costs skyrocketed. But what could we do about it?

We knew that any solution to the problem would need to reduce the amount of data
that was spilling from memory to disk. We needed to move away from
memory-intensive window functions, and also to stop “optimizing early” in the
pipeline with a giant intermediate daily table filled with mostly zeros. (Also,
moving some non-incremental builds to incremental would be good—in other words,
don’t compute over the whole table every time, just the newest data.)

Moving away from window functions and the big daily table required a different
type of time logic in SQL: instead of window functions across rows, we would
`JOIN` events directly to a list of dates and then do `GROUP BY` aggregations to
get the statistics we wanted. For example, instead of calculating a 30-day
moving average by literally averaging 30 numbers, we can do a `SUM` over the
event activity within a 30-day window and then divide by 30. Among other things,
this avoids the rows of zeros that we don’t really need, which means less data
to read into memory and potentially spill to disk during big window or
aggregation operations.

This implementation of a 30-day rolling average isn’t as intuitive to write or
read as using a window function, but it was computationally more efficient for
our data. 


## A more efficient implementation was only half the battle

The biggest challenge wasn’t writing the query code for this implementation.
Once the code was written, before we could push the code to production, we
needed to verify that it produced correct results—essentially the same results
as the current production code—and didn’t have any bugs that would mess up the
user experience for our app.

This quality assurance and roll-out process was incredibly tedious. Because the
changes we made were in the core of the pipeline—and because complex SQL can be
so hard to read, difficult to test, and a burden to debug—we needed to
painstakingly verify that everything downstream of the changes would not be
negatively affected. It took weeks of on-and-off code review, some manual
results verification, testing in a staging environment, and so on.

These new efficiency optimizations for the rolling-average calculations, which
is what we had set out to do, had turned into an overhaul of parts of the core
of the data pipeline, with a painful QA process and risky deployment into
production. Along the way, we had many discussions about implementation
alternatives, sizing up our cloud instances instead, and possibly even removing
some minor features from our app because they were too costly to compute. And
all of this started because the most intuitive way to calculate a 30-day rolling
average in SQL can be terribly inefficient if you are not careful and clever in
your implementations.


# Kaskada has one natural way to deal with time

In stark contrast with the above case study in SQL, Kaskada handles calculations
on time windows natively. They are easy to write and are designed to run
efficiently for all of the most common use cases. Time data is ordered data,
always, and Kaskada’s data model embodies that, making certain calculations
orders of magnitude more efficient than other unordered data models, like SQL.

When writing logic around time windows and window functions, we work with time
directly instead of—as with SQL—needing to turn time into rows before
calculating statistics and aggregations. By working directly with time, Kaskada
removes many opportunities to introduce bugs and inefficiencies when turning
time into rows and back again.

Let’s revisit the Kaskada code block from earlier in the article:

```fenl
Dataset.activity_value                       # specify the data
| sum(window=sliding(30, daily())) / 30      # sum values and divide
```

This query syntax has all of the important semantic information—data source,
sliding window, 30 days, `sum` function, division—and not much more.
Conceptually, that is enough information to do the calculations we want. Kaskada
knows how to get it done without us having to specify (yet again) what a day is,
how sliding windows work, or how to manipulate the rows of event data to make it
happen. With less code and less logic to worry about, there is much less surface
area to introduce bugs or inefficiencies.


## We shouldn’t have to write query logic about how time works

To put it half-jokingly, [Kaskada understands
time](https://kaskada.io/2022/12/15/the-kaskada-feature-engine-understands-time.html),
while with SQL you have to say repeatedly that the past comes before the future
and that a calendar day still exists even if you don’t have a row for it. How
many times in SQL do I have to write the same `JOIN` logic stating that the two
entity IDs have to be the same and that the event timestamps need to be less
than the time bucket/window timestamps? In Kaskada, you don’t have to write it
at all, and there are many other bugs and inefficiencies that can be avoided by
letting Kaskada handle time logic in the intuitive way (unless you want to use
different logic).


## Kaskada’s native timeline abstraction was built for this

[Kaskada's concept of
timelines](https://kaskada.io/2023/05/09/introducing-timelines-part-1.html) and
its overall time-centric design means that natural logic around time
calculations happens natively. Kaskada can do a 30-day rolling average with a
single line of code, more or less, and you don't have to think about the rows
filled with zeros or tables blowing up in size because the computational model
is focused on progressing through time, and not on producing, manipulating, and
storing rows.

In contrast, as illustrated earlier in this article, SQL has at least two
distinct ways to deal with time:

* __window functions__: build one row per day so that row calculations become day calculations
* __time JOINs__: event data JOINed into time buckets and aggregated

The first is conceptually easy to understand and potentially easy to write in
SQL if you are an expert. The second is not quite as easy to understand, and
requires writing logic in SQL about what it means for an event to belong to a
day or date. Both types of implementations leave the coder to choose how time
should work on each and every query that needs it—a recipe that invites trouble.


## Try it out and let us know what you think!

Kaskada is open-source and easy to set up on your local machine in just a few
minutes. For more information about how Kaskada and native timelines can
dramatically simplify coding logic and computational efficiency for time-centric
feature engineering and analytics on event-based data, see [our
documentation](https://kaskada.io/docs-site/kaskada/main/overview/what-is-kaskada.html),
in particular the [Getting Started
page](https://kaskada.io/docs-site/kaskada/main/getting-started/index.html). 

You can also [join our Slack channel]({{site.join_slack}}) to discuss and learn
more about Kaskada.
