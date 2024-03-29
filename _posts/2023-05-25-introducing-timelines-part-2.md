---
layout: post
title: "Introducing Timelines (Part 2): Declarative, Temporal Queries"
image: assets/images/blog/introducing-timelines-part-2.png
author: Ben Chambers and Therapon Skoteiniotis
---

Understanding time-based patterns in your data can unlock valuable insights, but expressing temporal queries can often be a challenging task.
Imagine being able to effortlessly analyze your users' behavior over time, to perform precise temporal joins, or to examine patterns of activity between different events, all while being intuitive and naturally handling time.
This is where the concept of timelines, a high-level abstraction for working with temporal data, comes to your aid.

In this blog post, we are diving deep into the world of timelines.
We'll demonstrate how they make expressing temporal queries on events, and importantly, between events, not just easy but also intuitive.
We previously [introduced the timeline][timelines_part1] a high-level abstraction for working with temporal data.
Timelines organize event-based data by time and entity, making it possible to reason about the context around events.
Express temporal queries using timelines have several benefits:

- **Intuitive**: Since timelines are ordered by time, it is natural for queries to operate in order as well. As time progresses, additional events – input – occur and are reflected in the output of the query. This way of thinking about computations – as progressing through time – is intuitive because it matches the way we observe events.
- **Declarative**: Temporal operations – like windowing and shifting – are clearly declared when working with timelines, since time is part of the abstraction.
- **Composable**: Every operation takes timelines and produces timelines, meaning that operations can be chained as necessary to produce the intended results.

In the next sections, we are going to dissect four real-life examples demonstrating the immense benefits of timelines. We'll start with a simple query for an aggregation and progressively tackle more intricate temporal windows, data-dependent windows, and temporally correct joins. By the end, you'll be left with a deep understanding of how timelines make writing simple temporal queries as straightforward as SQL and how they empower us to take on the more challenging questions.

# Total Spend: Cumulative Aggregation

Timelines support everything you can do in SQL, intuitively extended to operate over time.
Before looking at some new capabilities for sophisticated temporal queries, let’s look at something simple – an aggregation.
Writing simple queries is easy: in fact, since timelines are ordered by time and grouped by entity, they can be even easier than in SQL!

Consider the question, _how much did each user spend_?
When thinking about this over events, it is natural to process the purchases in order, updating the amount each user has spent over time.
The result is a _cumulative_ sum producing a _continuous timeline_.

![Timeline visualization of how much each user spent][aggregation]

The corresponding query is shown below written in two equivalent ways.
The first emphasizes the sum being applied to the purchases while the second emphasizes the chain of operations we have composed – “take the purchases then apply the sum”.
In the remainder of this post we’ll use the latter since it better matches the way we tend to think about processing timelines.

```fenl
sum(Purchases.amount)

# OR

Purchases.amount
| sum()
```

Writing simple temporal queries with timelines was as easy as SQL.
Processing events in order is an intuitive way of operating over time.
Of course, aggregating over all events is only one way we may wish to aggregate things.
In the next example, we’ll see how to extend this query using temporal windows to focus on recent events.

# Monthly Spend: Temporal Windowing

When thinking about temporal queries, it’s very natural to ask questions about the recent past – year-to-date or the last 30 days.
The intuition of processing events in order suggests answering the question “_how much has each user spent this month_” should just require resetting the value at the start of each month.
And this intuition is exactly how these kinds of temporal windows work with timelines.

![Timeline visualization of how much each user spent this month][windowed]

The temporal query is shown below.
It clearly indicates the intent we expressed above – take the purchases and aggregate them since the beginning of each month.

```fenl
Purchases.amount
| sum(window=since(monthly()))
```

Since time is inherently part of every timeline, every aggregation is able to operate within temporal windows.
In the next example we’ll see how easy it is to work with more complicated queries, including aggregations with more sophisticated windows.

# Page Views Between Purchases

Not all windows are defined in terms of time.
It is often useful to use events to determine the windows used for an aggregation.
Additionally, while all the examples so far have operated on a single type of event – `Purchases` – examining the patterns of activity between different events is critical for identifying cause and effect relationships.
In this example we’ll take advantage of timelines to declaratively express queries using data-defined windows and multiple types of events.
We’ll also filter an intermediate timeline to specific points to control the values used in later steps while composing the query.

The question we’ll answer is “_what is the average number of page-views between each purchase for each user_?”.
We’ll first compute the page views since the last purchase, observe them at the time of each purchase, and then take the average.

## Data-Defined Windowing
The first thing we’ll do is compute the number of page views since the last purchase.
In the previous example, we windowed since the start of the month.
But there is nothing special about the timeline defining the start of a month – we can window with any other timeline.

```fenl
PageViews
| count(window=since(is_valid(Purchases)))
```

![Timeline showing data-defined windows][data_windows_1]

In addition to data-defined windowing, we see how to work with multiple types of events.
Since every timeline is ordered by time and grouped by entity, every timeline can be lined up by time and joined on entity – _automatically_.

## Observing at specific times
The previous step gave us the page views since the last purchase.
But it was a continuous timeline that increased at each page view until the next purchase.
We’re after a discrete timeline with a single value at the time of each purchase representing the page views since the previous purchase.
To do this, we use the [`when`]({% fenl_catalog when %}) operation which allows observing – and interpolating if needed – a timeline at specific points in time.

![Observing a timeline at specific points in time using when][data_windows_2]

The `when` operation can be used anywhere in a temporal query and allows for filtering points which are present in the output – or passed to later aggregations.

# Nested Aggregation
With the number of page views between purchases computed, we are now able to compute the average of this value.
All we need to do is use the [`mean`]({% fenl_catalog mean %}) aggregation.

![Applying an outer aggregation to compute the average of observed page views][data_windows_3]

# Putting it together
The complete query is shown below.
We see the steps match the logical steps we talked through above.
Even though the logic was reasonably complex, the query is relatively straightforward and captures our idea for what we want to compute – hard questions are possible.

```fenl
PageViews
| count(window=since(is_valid(Purchases)))
| when(is_valid(Purchases))
| mean()
```

This kind of query can be generalized to analyze a variety of patterns in the page view activity.
Maybe we only want to look at the page views for the most-frequently viewed item rather than all items, believing that the user is becoming more focused on that item.
Maybe we want to window since purchases of the same item, rather than any purchase.

This query showed some ways timelines enable complex temporal queries to be expressed:
1. Ordering allows windows to be defined by their delimiters – when they start and end – rather than having to compute a “window ID” from each value for grouping.
1. Ordering also allows multiple timelines to be used within the same expression – in this case `PageViews` and `Purchases`.
1. Continuity allows values to be interpolated at arbitrary times and filtered using the `when` operation.
1. Composability allows the result of any operation to be used with later operations to express temporal questions. This allows complex questions to be expressed as a sequence of simple operations.

These capabilities allow identifying cause-and-effect patterns.
While it may be that a purchase _now_ causes me to make purchases _later_, other events often have a stronger relationship – for instance, running out of tape and buying more, or scheduling a camping trip and stocking up.
Being able to look at activity (`PageViews`) within a window defined by other events (`Purchases`) is important for understanding the relationship between those events.

# Minimum Review Score

We’ve already seen how timelines allow working with multiple types of events associated with the same entity.
But it’s often necessary to work with multiple entities as well.
For instance, using information about the entire population to normalize values for each user.
Our final example will show how to work with multiple entities and perform a temporal join.

The final question we’ll answer is _“what is the minimum average product review (score) at time of each purchase?”_.
To do this, we’ll first work with reviews associated with each product to compute the average score, and then we’ll join each purchase with the corresponding average review.

## Changing entities
To start, we want to compute the average product review (score) for each item.
Since the reviews are currently grouped by user, we will need to re-group them by item, using the [`with_key`]({% fenl_catalog with_key %}) operation.
Once we’ve done that, we can use the `mean` aggregation we’ve already seen.

![Timelines computing the per-item average score][temporal_join_1]

## Lookup between entities
For each purchase (grouped by user) we want to look up the average review score of the corresponding item.
This uses the [`lookup`]({% fenl_catalog lookup %}) operation.

![Timelines using lookup to temporally join with the item score][temporal_join_2]

## Putting it together
Putting it all together we use the lookup with a [`min`]({% fenl_catalog min %}) aggregation to determine the minimum average rating of items purchased by each user.

```fenl
Reviews.score
| with_key(Reviews.item)
| mean()
| lookup(Purchases.item)
| min()
```

This pattern of re-grouping to a different entity, performing an aggregation, and looking up the value (or shifting back to the original entities) is common in data-processing tasks.
In this case, the resulting value was looked up and used directly.
In other cases it is useful for normalization – such as relating each user’s value to the average values in their city.

Ordering and grouping allow timelines to clearly express operations between different entities.
The result of a lookup is from the point-in-time at which the lookup is performed.
This provides a temporally correct “as-of” join.

Performing a join _at the correct time_ is critical for computing training examples from the past that are comparable to feature values used when applying the model.
Similarly, it ensures that any dashboard, visualization, or analysis performed on the results of the query are actually correct as if they were looking at the values in the past, rather than using information that wasn’t available at that time.

# Conclusion

In this post, we've demonstrated the power of timelines as a high-level abstraction for handling temporal data.
Through intuitive, declarative, and composable operations, we showed how timelines enable efficient expression of temporal queries on events and between events.
With examples ranging from simple aggregations to sophisticated queries like data-dependent windows and temporally correct joins, we illustrated how timeline operations can be chained to produce intended results.
The potency of timelines lies in their ability to easily express simple temporal questions and intuitively extend to complex temporal queries.

From total spend to minimum review score, we walked through four illustrative examples that highlight the capabilities of timelines in temporal querying.
We explored cumulative aggregation, temporal windowing, and observed how data-defined windowing offers the ability to express complex temporal questions.
We also showed how timelines facilitate multi-entity handling and temporal joins.
These examples show that with timelines, you have a powerful tool to identify cause-and-effect patterns and compute training examples that are comparably valid when applying a model.

In the next post in this series, we delve further into the dynamics of temporal queries on timelines.
We'll explore how these queries are efficiently executed by taking advantage of the properties of timelines.

We encourage you to [Get started][getting_started] writing your own temporal queries today, and [join our Slack channel]({{site.join_slack}}) for more discussions and insights on timelines and other data processing topics.
Don't miss out on this opportunity to be a part of our growing data community.
Join us now and let's grow together!

[timelines_part1]: {% post_url 2023-05-09-introducing-timelines-part-1 %}
[getting_started]: https://kaskada.io/docs-site/kaskada/main/getting-started/index.html

[aggregation]: /assets/images/blog/introducing-timelines/aggregation.svg "Timelines showing purchases and sum of purchases"
[windowed]: /assets/images/blog/introducing-timelines/windowed.svg "Timelines showing purchases and sum of purchases since start of the month"
[data_windows_1]: /assets/images/blog/introducing-timelines/data_windows_1.svg "Timelines showing count of page views since last purchase"
[data_windows_2]: /assets/images/blog/introducing-timelines/data_windows_2.svg "Timelines showing count of page views since last purchase observed at each purchase"
[data_windows_3]: /assets/images/blog/introducing-timelines/data_windows_3.svg "Timelines showing average of the page view count between purchases"
[temporal_join_1]: /assets/images/blog/introducing-timelines/temporal_join_1.svg "Timelines computing the average item review score"
[temporal_join_2]: /assets/images/blog/introducing-timelines/temporal_join_2.svg "Timelines looking up the average review score for each purchase"