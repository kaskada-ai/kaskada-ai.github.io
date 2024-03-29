---
layout: post
title: "Kaskada for Event Processing and Time-centric Calculations: Ecommerce and Beyond"
image: assets/images/blog/kaskada-for-event-processing-and-time.png
author: Brian Godsey
---


Kaskada was built to process and perform temporal calculations on event streams,
with real-time analytics and machine learning in mind. It is not exclusively for
real-time applications, but Kaskada excels at time-centric computations and
aggregations on event-based data.

For example, let's say you're building a user analytics dashboard at an
ecommerce retailer. You have event streams showing all actions the user has
taken, and you'd like to include in the dashboard:

* the total number of events the user has ever generated
* the total number of purchases the user has made
* the total revenue from the user
* the number of purchases made by the user today
* the total revenue from the user today
* the number of events the user has generated in the past hour

Because the calculations needed here are a mix of hourly, daily, and over all of
history, more than one type of event aggregation needs to happen. Table-centric
tools like those based on SQL would require multiple `JOINs` and window functions,
which would be spread over multiple queries or code blocks (CTEs).

Kaskada was designed for these types of time-centric calculations, so we can do
each of the calculations in the list in one line (with some text wrapping):

```
event_count_total: DemoEvents | count(),
purchases_total_count: DemoEvents | when(DemoEvents.event_name == 'purchase')
    | count(),
revenue_total: DemoEvents.revenue | sum(),
purchases_daily: DemoEvents | when(DemoEvents.event_name == 'purchase')
    | count(window=since(daily())),
revenue_daily: DemoEvents.revenue | sum(window=since(daily())),
event_count_hourly: DemoEvents | count(window=since(hourly())),
```


Of course, a few more lines of code are needed to put these calculations to
work, but these six lines are all that is needed to specify the calculations
themselves. Each line may specify:

* the name of a calculation (e.g. `event_count_total`)
* the input data to start with (e.g. `DemoEvents`)
* selecting event fields (e.g. `DemoEvents.revenue`)
* function calls (e.g. `count()`)
* event filtering (e.g. `when(DemoEvents.event_name == 'purchase')`)
* time windows to calculate over (e.g. `window=since(daily())`)

...with consecutive steps separated by a familiar pipe (`|`) notation.

Because Kaskada was built for time-centric calculations on event-based data, a
calculation we might describe as "total number of purchase events for the user"
can be defined in Kaskada in roughly the same number of terms as the verbal
description itself.

See [the Kaskada
documentation](https://kaskada.io/docs-site/kaskada/main/installing.html)
for lots more information.


# Installation

Kaskada is published alongside most familiar python packages, so installation is
as simple as:

```
pip install kaskada
```


# Example dataset

The demo uses a very small example data set, but you can load your own event
data from many common sources, including any pandas dataframe. See [the Loading
Data
documentation](https://kaskada.io/docs-site/kaskada/main/loading-data.html)
for more information.


# Define queries and calculations

The Kaskada query language is parsed by the fenl extension, and query
calculations are defined in a code blocks starting with `%%fenl`.

See [the fenl
documentation](https://kaskada.io/docs-site/kaskada/main/fenl/fenl-quick-start.html)
for more information.

A simple query for events with a specific entity ID looks like this:

```
%%fenl

DemoEvents | when(DemoEvents.entity_id == 'user_002')
```


When using the pipe notation, we can use `$input` to represent the thing being
piped to a subsequent step, as in:

```
%%fenl

DemoEvents | when($input.entity_id == 'user_002')
```


Beyond querying for events, Kaskada has a powerful syntax for defining
calculations on events, temporally across the event history.

The six calculations discussed at the top of this demo can be written as
follows:

```
%%fenl

{
    event_count_total: DemoEvents | count(),
    event_count_hourly: DemoEvents | count(window=since(hourly())),
    purchases_total_count: DemoEvents
        | when(DemoEvents.event_name == 'purchase') | count(),
    purchases_daily: DemoEvents
        | when(DemoEvents.event_name == 'purchase') | count(window=since(daily())),
    revenue_daily: DemoEvents.revenue | sum(window=since(daily())),
    revenue_total: DemoEvents.revenue | sum(),
}
| when(hourly())  # each row in the output represents one hour of time
```


## Trailing when() clause

A key feature of Kaskada's time-centric design is the ability to query for
calculation values at any point in time. Traditional query languages (e.g. SQL)
can only return data that already exists---if we want to return a row of
computed/aggregated data, we have to compute the row first, then return it. As a
specific example, suppose we have SQL queries that produce daily aggregations
over event data, and now we want to have the same aggregations on an hourly
basis. In SQL, we would need to write new queries for hourly aggregations; the
queries would look very similar to the daily ones, but they would still be
different queries.

With Kaskada, we can define the calculations once, and then separately specify
the points in time at which we want to know the calculation values.

Note the final line in the above query:

```
| when(hourly())
```

We call this a "trailing `when()`" clause, and its purpose is to specify the time
points you would like to see in the query results.

Regardless of the time cadence of the calculations themselves, the query output
can contain rows for whatever timepoints you specify. You can define a set of
daily calculations and then get hourly updates during the day. Or, you can
publish a set of calculations in a query view (see below), and different users
can query those same calculations for hourly, daily, and monthly
values---without editing the calculation definitions themselves.


## Adding more calculations to the query

We can add two new calculations, also in one line each, representing:

* the time of the user's first event
* the time of the user's last event

We can also add the parameter `--var event_calculations` to save the results
into a python object called `event_calculations` that can be used in subsequent
python code.


```
%%fenl --var event_calculations

{
    event_count_total: DemoEvents | count(),
    event_count_hourly: DemoEvents | count(window=since(hourly())),
    purchases_total_count: DemoEvents
        | when(DemoEvents.event_name == 'purchase') | count(),
    purchases_daily: DemoEvents
        | when(DemoEvents.event_name == 'purchase')
        | count(window=since(daily())),
    revenue_daily: DemoEvents.revenue | sum(window=since(daily())),
    revenue_total: DemoEvents.revenue | sum(),

    first_event_at: DemoEvents.event_at | first(),
    last_event_at: DemoEvents.event_at | last(),
}
| when(hourly())
```


This creates the python object `event_calculations`, which has an attribute
called `dataframe` that can be used like any other dataframe, for data
exploration, visualization, analytics, or machine learning.

```
# access results as a pandas dataframe
event_calculations.dataframe
```


This is only a small sample of possible Kaskada queries and capabilities. See
[the fenl catalog for a full
list](https://kaskada.io/docs-site/kaskada/main/fenl/catalog.html) of
functions and operators.


# Publish Query Calculation Definitions as Views

The definitions of your query calculations can be published in Kaskada and used
elsewhere, including in other Kaskada queries.

```
from kaskada import view as kview

kview.create_view(
  view_name = "DemoFeatures",
  expression = event_calculations.expression,
)

# list views with a search term
kview.list_views(search = "DemoFeatures")
```

We can query a published view just like we would any other dataset.

```
%%fenl

DemoFeatures | when($input.revenue_daily > 0)
```

# Try it out and tell us what you think!

The content of this blog post is based on the public notebook at the link:
[Kaskada Demo for Event Processing and Time-centric
Calculations](https://github.com/kaskada-ai/kaskada/blob/main/examples/Kaskada%20Demo%20for%20Event%20Processing%20and%20Time-centric%20Calculations.ipynb).
Kaskada is a brand new open source project, which makes your early feedback
exceptionally important to us.

We think that Kaskada could be exceptionally useful for anyone trying to turn
event data into analytics, ML features, real-time stats of all kinds, and
insight in general. Have a look at the notebook, and [let us know what you like
and don't like about it](https://github.com/kaskada-ai/kaskada/discussions)!

