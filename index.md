---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: page
---

<div class="container mt-5 mb-5">
    <h1> The engine for real-time ML</h1>

    <div class="row">
        <div class="col-12">
            <p>Kaskada is a query engine for event-based data designed for building & operating real-time ML at scale.</p>
        </div>
    </div>

    <div class="row mt-5">
        <div class="col-3">
            <h3>Native Time Travel.</h3>
            <p>Revisit the result of any query at any point in time.</p>
            <p>Use the same query languge to define what to compute and to when to compute it.</p>
        </div>

        <div class="col-3">
            <h3>Instant exploration.</h3>

            Efficiently compute directly from raw events.
            Safely downsample results with input slicing.
        </div>

        <div class="col-3">
            <h3>Unified queries.</h3>

            Execute the same query in batch mode over historical data or in incremental mode over real-time streams.
        </div>

        <div class="col-3">
            <h3>It's fast</h3>

            Compute engine implemented in Rust for performance and safety.
            Computation is built on Apache Arrow for speedy CPU utilization.
        </div>
    </div>

    <div class="row mb-5">
        <div class="col-3">
            <h3>Temporal joins.</h3>

            Compute point-in-time operations between differently-grouped results.
            Combine results defined at different times as continuous values.
        </div>

        <div class="col-3">
            <h3>Real-time, but with history.</h3>

            Transparently bootstrap real-time queries with the full history of raw events.
        </div>
    </div>

    <h2> Why Kaskada</h2>

    <div class="row">
        <div class="col-6">
            <p>Kaskada unifies historical and real-time data processing, allowing practitioners to instantly reconstruct the historical results of a query and then deploy the same query as a live materialization without losing historical context.</p>
            <a class="btn btn-primary" href="https://docs.kaskada.com">Get Started</a>
        </div>
        <div class="col-6">
            <p>Kaskada’s unique capabilities are the result of its time-aware query abstractions, a high-performance compute engine, and a configurable execution model supporting bulk and real-time data processing.</p>
        </div>
    </div>
</div>
