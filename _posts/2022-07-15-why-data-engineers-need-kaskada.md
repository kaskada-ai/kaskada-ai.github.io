---
layout: post
title: Why Data Engineers Need Kaskada?
image: https://images.ctfassets.net/fkvz3lhe2g1w/FafYi4yNNlk7MnW8MkDA2/74af3f28de77f37c0addc18eb9d616b2/Screenshot_2022-12-05_at_2.40.50_PM.png?w=2880
---
ℹ️NOTE: Kaskada is now an open source project! Read the announcement [blog]({% post_url /2023-03-28-announcing-kaskada-oss %}).
{: .note }

Building and deploying machine-learning (ML) models is challenging. It’s hard for many reasons, but one of the biggest is that the compute engines we use to build ML models were designed to solve different and incompatible problems.

Behavioral models work by revisiting the past to learn how the world behaves, then using these lessons to predict the future. The ability to revisit the past is  _central_  to training behavioral models, but traditional compute engines don’t know anything about time. These tools tell us the  _answer_  to a query, but we need tools that tell us the  **_story_** **of how**  the answer has changed over time.

Kaskada is a time-based feature engine based on manipulating  _streams of values_. These streams tell the story of exactly how the result of a computation changes over time. Knowing the whole story allows Kaskada to provide a unique set of powerful time-based operations that result in the ability to develop and deliver behavioral ML models rapidly.

## **What other engines are good for**

Traditional compute engines serve many use-cases well. For example, data analysis over “web-scale” datasets has benefitted from decades of investment and innovation: tools like Spark, Presto, and Snowflake make it possible to analyze data at a massive scale. Whatever your analytic use case, there is likely a mature compute engine you can use. These systems emphasize throughput and model computation as a short-lived query or job.

Similarly, event handling at scale has benefitted from significant innovation and investment. We can now choose from scalable event logs such as Kafka, Pulsar, or RabbitMQ. You can implement handling logic various frameworks such as Flink or Apex. Streaming compute engines are less mature than their analytic counterparts, but recent years have seen significant improvements. Many use cases are well-served, for example, monitoring, event-sourcing, and aggregations over short-lived windows. These streaming systems emphasize latency and model computation as a long-lived process.

You’ve probably worked with many of these systems before. Many organizations have developed robust technical infrastructure to support data collection, analysis, monitoring, and real-time event processing,

It’s reasonable to assume that the tools and infrastructure that support these use cases so well will also support the development and deployment of ML models. Unfortunately, this often isn’t the case; behavioral ML has unique and challenging requirements.

## **Why Behavioral ML is hard with other engines**

ML is a broad category that includes everything from simple classifiers to massive neural networks for machine translation. Kaskada focuses on  _behavioral_ models - models that learn cause-and-effect relationships to predict how the world will behave in the future, given our knowledge of the past. These models are used for personalization, demand forecasting, or risk modeling applications. Building a behavioral model is typically slow, complex, and frustrating - because understanding behavior means understanding the  _story_  of cause and effect.

## **Time Travel**

Our knowledge of the world is constantly growing: the passage of time uncovers the  _effects_  that behavioral models learn to correlate with earlier  _causes_. Training behavioral models requires reconstructing what was known about the world at specific times in the past - limiting computations to inputs older than a given point in time. The most important information is often the most recent when making a prediction, so fine-grained time travel is necessary. Existing analytic compute engines treat time as just another column and don’t provide abstractions for reconstructing the past.

## **Deferred Decisions**

Feature engineering is an experimental process. To complicate matters further, it’s often impossible to know beforehand the features and observation times needed to train a successful model. Improving model performance generally requires an iterative process of trial-and-error - each iteration exploring different ways of filtering and aggregating information.

## **Incremental Computation**

While training a behavioral model often requires large amounts of historical data, it’s often necessary to make predictions quickly once a model is in production. Usually, models whose inputs depend on aggregating historical data precompute these aggregates and maintain the “current” value in a dedicated feature store. Existing tools force a choice between throughput-optimized analytic and latency-optimized streaming engines, but both use-cases are part of the ML lifecycle.

## **Sharing & Discovery**

High-quality features can often be re-used to make several related models - similar to shared software libraries. Like software, feature definitions must be managed over an extended life cycle during which different individuals may join and leave the team. The ability to reuse feature definitions and quickly understand the logic behind a given feature significantly reduces the cost of developing and maintaining ML models. The architecture required to make existing tools work for ML often results in a system whose complexity makes feature sharing and maintenance painful.

# How Kaskada is different

Kaskada is a new type of feature compute engine designed from the ground up to address these challenges. Computations in Kaskada are described using composable abstractions intended to tell stories from event-based data and bridge the divide between historical and incremental computation.

## **Abstractions**

Tools like Spark describe computation using operations drawn from functional programming (map, reduce, filter, etc.) and apply these operations to data represented as RDDs or dataframes. SQL-based query engines describe computation using operations drawn from relational algebra (select, join, aggregation, and element-wise mapping) and apply these operations to data represented as tables.

Kaskada describes computation using a set of operations similar to SQL’s element-wise and aggregation functions (add, sum, min, etc.) but applies these operations to time-stamped streams of values.

## **Unique Operations**

By keeping the time component of computations, Kaskada can concisely describe many operations that would be difficult or impractical using the abstractions of traditional compute engines.

Kaskada distinguishes between two types of value streams: discrete and continuous. Discrete values are described at specific instants, for example, events. Continuous values are defined over time intervals, for instance, aggregations like the maximum value seen to date. This distinction makes it easy to zip together time streams computed at different points in time, for example combining event-level values with aggregated values.

Values in a stream are associated with an “entity.” Aggregations are limited to values with the same entity. These unique operations result in queries with very little boilerplate code specifying group-by and join constraints and maintain the ability to group, regroup and join between differently-grouped values. Every operation in Kaskada preserves time, including joins - the result of a join operation is a stream describing how the result of the join changes over time.

Kaskada supports operating both on a stream’s values and its times. Streams can be shifted forward in time to combine values computed at different times. For example, when labeling an example’s outcome one week in the future, the predictor features are shifted forward a week and combined with a computed target feature to produce a training example. Values cannot be shifted backward in time, making it challenging to introduce temporal leakage into training datasets accidentally.

## **Unified Queries over Historical & Incremental Data**

A given Kaskada computation can produce training examples from historical events  _or_  process new events as they arrive incrementally. This unification is possible because queries are described in terms of value streams, allowing the details of incremental vs. non-incremental computation to be abstracted away from the query author.

Kaskada builds on this to support continuously writing the results of a given query to external data stores, a feature we call “materializations.” You can use materializations to keep a low-latency feature store up to date as data arrives to support online predictions.

## **Composable & Declarative MLOps**

Kaskada supports the extended ML lifecycle by streamlining feature reuse and integrating with your existing infrastructure management process. Features in Kaskada are easy to understand, “what” to compute, and “when” is described as part of the query expression. Since features are just code, they’re easy to reuse, refine and extend. Kaskada infrastructure can be managed as code in production using a declarative specification file and the same code review and change management processes you already have in place.

# Conclusion

Behavioral ML models are challenging to develop and deploy using traditional compute engines due to these models’ unique requirements. Building training datasets depends on understanding the stories in your data, and the trial-and-error nature of model training means you need the ability to experiment with different aggregations and prediction time selections interactively. After training a model, you often need to maintain the current value of millions of feature vectors as data arrives to support online predictions. Features can often be re-used in multiple models, so improving feature discoverability and reusability can significantly accelerate the “second model.”

We designed Kaskada specifically to support iterative time-based feature engineering. By starting with a new set of abstractions for describing feature computation, Kaskada provides unique and powerful operations for describing what to compute and when to compute it. Kaskada is fully incremental, allowing features to be efficiently updated as data arrives. Kaskada queries are composable and readable, simplifying feature discovery and reuse.

In the past, behavioral ML has been hard to develop and maintain, but it doesn’t have to be. By using the right tool for the job you can build and deploy models in a fraction of the time. After migrating their behavioral ML feature engineering from traditional compute engines to Kaskada, our users typically see at least 25x reductions in time-to-production and are able to explore thousands of times more feature variations - resulting in better-performing models.

Trying out Kaskada is easy - you can signup today for free and start discovering the stories hidden in your data.