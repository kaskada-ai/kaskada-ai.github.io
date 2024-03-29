---
layout: post
title: The Kaskada Feature Engine Understands Time
image: https://images.ctfassets.net/fkvz3lhe2g1w/7wzGBKVlTO5CvTue4XJ3tl/56ac2361df0a6bf465b80efcaba3d2eb/Copy_of_Feature_Engines__1_.png?w=2880
---
ℹ️NOTE: Kaskada is now an open source project! Read the announcement [blog]({% post_url /2023-03-28-announcing-kaskada-oss %}).
{: .note }

This is the second part in our “How data science and machine learning toolsets benefit from Kaskada’s time-centric design” series, illustrating how data science and machine learning (ML) toolsets benefit from Kaskada’s time-centric design, and specifically how Kaskada’s feature engineering language, FENL, makes defining and calculating features on event-based data simpler and more maintainable than the equivalents in the most common languages for building features on data, such as SQL and Python Pandas.

Part 1 of this series —  **_Kaskada Was Built for Event-Based Data_**  — gives an introduction to the challenges of working with event-based data, and how Kaskada makes defining features straight-forward.

## What it Means to Understand Time

Events, by definition, include some concept of time: when did the event happen? Therefore, processing of event data, almost always treats time as a very important attribute of the data—and often treats it as one of the two most important aspects of the data, together with the entity we need information about.

When a time variable is important in data processing or feature engineering, we often do two things:

1.  Index our data store along a time dimension

2.  Partition the data by the entity we want to understand or make predictions about

3.  Do lots of aggregations and/or JOINs on a time dimension


When storing data, indexing and partitioning is crucial for maintaining computational efficiency. In very large datasets, locating data for a particular point or narrow range in time and entity can be incredibly inefficient if the data is not indexed and partitioned correctly. So, when time matters, we make sure to index and store the data in a way that makes it easy to access the correct data from the correct time and partition the data to improve parallelization.

When processing event data for the purposes of aggregation or for building features for machine learning, item (3) above is very often necessary—we aggregate and JOIN (in the SQL sense) along a time dimension in order to know the status of things at given points in time and to summarize event activity over time intervals. In SQL, as well as other tools that use SQL-like syntax and computation (such as many pandas dataframe operations), point-in-time statuses might require a rolling window function, while summarizing time intervals would happen via group aggregations on a time bucket column, e.g. date or month.

Alternatively, with more functional or Pythonic feature calculation, as opposed to SQL-like operations, we need to write our own code that explicitly loops through time (as in a FOR or WHILE loop), caching, aggregating, and calculating as specified in a function definition.

With Kaskada’s feature engine and FENL, users don’t need to explicitly loop through time like the functional paradigm, and they also don’t need to worry about time-based JOIN logic like in the SQL paradigm. Processing data and calculating features over time is the default behavior, and it understands the basic units of time—such as hour, day, and month—without needing to calculate them every time, fill in missing rows, or write any JOIN logic at all for many of the most common aggregations on time and entity.

In short, FENL provides the abstractions and Kaskada provides the calculation engine that automatically and efficiently, by default, handles time-based feature calculations in the most common, natural way.

## Without understanding time, it is just another numeric variable

Time is an ordered, numeric quantity, which is particularly obvious when it appears in a Unix/epoch format—seconds since the midnight preceding January 1st, 1970 is a real number that goes up into the future, and down into the past. However, time has some properties that many other numeric quantities do not:

1.  Time is generally linear—a second in the future is equivalent to a second in the past, and rarely do we use time itself on an exponential or logarithmic scale, though many variables depend on time in non-linear ways.

2.  Periods of time exist whether we have data for them or not—the hours and seconds during holidays, lunch breaks, and system downtime still appear on a clock somewhere, even if no data was produced during that time.

3.  For event-based data, time is an implicit attribute—events have at least a relative time of occurrence, by definition, and without it an event can lose most or all of its context and meaning.


These properties of time provide opportunities for feature engines to make some starting assumptions and to build both syntactic and computational optimizations for calculating feature values over time variables. It is a purpose-built machine that is largely superior to general-purpose machines when used for the appropriate purposes, but which may be inferior for use cases beyond its design. Because transformations and calculations on time variables are very common, there are lots of practical opportunities for the Kaskada feature engine and FENL to improve upon general-purpose tools like SQL- and python-based feature stores.

Below, we illustrate some of the most often seen benefits of the natural understanding and optimization of time that is built into Kaskada and FENL.

## **Aggregating data into time intervals**

Some common data products that are generated from time-centric data involve designating a set of time intervals or buckets, and aggregating data in some way into these buckets. Hourly, daily, or monthly reporting involves—by definition—aggregating data by hour, day, or month. Data visualization over time also typically requires some aggregation into time buckets.

In order to make use of them, time buckets need to be defined somewhere in any code, whether SQL, python/pandas, or FENL. In SQL and python, we have some concise ways to extract the hour, day, or month from date-time objects, and also to calculate those from Unix/epoch seconds—probably involving a couple of function calls for date-time truncation or object type conversion. In FENL, we can simply pass the standard functions hourly(), daily(), or monthly() as parameters to any relevant feature definition, and the Kaskada feature engine handles these time intervals in the natural way. See the  [section on Time Functions in the Kaskada Catalog](https://kaskada.io/docs-site/kaskada/main/fenl/catalog.html#time-functions)  for more details.

When performing the actual aggregations by time bucket, SQL or pandas would likely use a GROUP BY statement, which might look like this:

```
select
     entity_id
     , event_hour_start
     , count(*) as event_count_hourly
from
     events_table
group by
        1, 2, 3
```

Non-pandas python would probably use a more manual strategy, like looping through the calculated time buckets.

FENL’s syntax for the same would look something like this:

```fenl
{
   entity_id,
   timestamp,
   event_count_hourly: EventsTable | count(window=since(hourly())),
}
```

While I could argue that FENL’s syntax is somewhat more concise here, it’s more important to point out that, if we wanted both the hourly and the daily event counts, SQL would require two separate CTEs and GROUP BYs (roughly double the amount of SQL code above), whereas FENL can do both in the same code block because FENL understands time, and features are defined independently, like so:

```fenl
{
   entity_id,
   timestamp,
   event_count_hourly: EventsTable | count(window=since(hourly())),
   event_count_daily: EventsTable | count(window=since(daily())),
}
```

Notably, using these hourly() and daily() functions in FENL will automatically include all of the time intervals, hours and days, within the time range of the query, regardless of whether there is data in the time intervals or not. SQL, on the other hand, does not automatically produce a row for a time interval if there was no data in the input corresponding to that time interval.

## Calculating features over rolling windows of time

Both SQL and python have date-time objects that are good at representing and manipulating points in time, but these cannot concisely enable calculations during the passage of time. Rolling window calculations present a good example of this.

Let’s say we want to calculate a rolling average of daily event counts over the last 30 days. It seems pretty simple in concept: every day, take the 30 event counts from the past 30 days and average them. But, we have to take care to avoid some common problems. For example, what if a day has no events? Is there a row/entry in the input dataset containing a zero for that day, or is that day simply missing? To get the answers to these questions, we must look upstream in our data pipeline to see how we are generating the inputs to this calculation.

In SQL, the most common way to calculate a 30-day rolling average is to use a window function over a table where each day has its own row, which might look something like this:

```
select
     entity_id
     , date
     , avg(event_count) over (
         order by date rows between 29 preceding and current row
     ) as avg_30day_event_count
from
     events_table
```

Sometimes, when sourcing clean, complete, processed data, this type of SQL window function will work as-is. However, window functions require all rows to represent equal units of time, and there can be no missing rows. So, if we can’t guarantee that both of these are true, in order to guarantee that the above query will work, we need to aggregate to rows of daily values and fill in missing rows with zeros.

We can aggregate to daily rows as in the previous section above. Filling in missing rows requires us to produce a list of all of the dates we are concerned with, independent of our data, to which we then JOIN our aggregated data, filling in zeros where the aggregated data had missing rows. Such a list of dates within a time range is often called a date spine, and could be generated by a recursive CTE as in:

```
/* a recursive CTE for generating a single `event_day_end` column that increments by 1 day */
       with recursive day_list(event_day_end) as (
           /* start at the first day in the data*/
           values( (select min(event_day_end) from events_table) )
           union all
           select
               datetime(strftime('%Y-%m-%d %H:00:00', event_day_end), '+1 day')
           from
               day_list
           limit 1000  /* just needs to be larger than the expected number of rows/days */
       )
```

We would then JOIN our table/CTE of daily aggregations to this date spine, and rows that were formerly missing would now be present and filled with zeros.

To reiterate, to use SQL to get 30-day rolling average event counts, we would:

1.  Aggregate the event data by date

2.  Build a date spine

3.  JOIN the daily aggregation to the date spine

4.  Apply a rolling window function


Each of these steps would be one CTE, more or less, but of course you could combine them into more compact but less readable queries. There are other ways to do this in SQL that avoid window functions, but which still involve most or all of the other steps, plus additional ones.

In FENL, we don’t need a date spine or a JOIN, and we can apply the aggregation and the rolling window using functions in the individual feature definition, as in:

```fenl
{
entity_id,
timestamp,
avg_30day_event_count: EventsTable
        | count(window=since(daily()))
        | mean(window=sliding(30, daily()))
}
```

See our  [FENL vs SQL vs Python Pandas Colab notebook](https://colab.research.google.com/drive/1Wg02zrxrJI_EEN8sAtoEXsRM7u8oDdBw?usp=sharing)  for more detailed code examples, more details, information, and example notebooks are available on  [Kaskada’s documentation pages](https://kaskada.io/docs-site).