---
layout: page
title: Community
permalink: /community/
---

# Welcome to the Kaskada community!

The Kaskada project was open-sourced in 2023. As a growing community, we're here to explore new ways to interact with data at scale and have some fun along the way. We build in the open and use the channels below for communication.

## Discussions

If you have questions about developing apps or want to learn more about Kaskada, you can start a [GitHub Discussion](https://github.com/kaskada-ai/kaskada/discussions) or read the [FAQ section](https://supreme-garbanzo-49gzqye.pages.github.io/kaskada/main/fenl/fenl-faq.html of our docs).

For news and announcements, follow us on Twitter: [@kaskadainc](https://twitter.com/kaskadainc).

Join the Kaskada group on LinkedIn: [@kaskadainc](https://www.linkedin.com/company/kaskadainc).

## Events

{% for event in site.events %}
### [{{ event.name }}]({{ event.url }}) {{ event.date | date_to_string }}
{% endfor %}

## Contributing

Nothing makes us happier than community contributions. See the [README](https://github.com/kaskada-ai/kaskada/blob/main/README.md) in the main Kaskada repository to get a grasp of the project layout and reference the [CONTRIBUTING](https://github.com/kaskada-ai/kaskada/blob/main/CONTRIBUTING.md) file for detailed steps.

Use the [GitHub issue tracker](https://github.com/kaskada-ai/kaskada/issues) to file bugs and feature requests.

Acceptance of the DataStax [contributor license agreement](https://cla.datastax.com/) (CLA) is required in order for us to be able to accept your code contribution. You will see this on the standard pull request checklist for the Kaskada repositories.

If you're interested in contributing but don't know where to start, we also recommend looking for a good first issue in the main repository.

## Code of Conduct

To make Kaskada a welcoming and harassment-free experience for everyone, we adopt and follow the [Contributor Covenant](https://www.contributor-covenant.org/). Please read our [Code of Conduct](https://github.com/kaskada-ai/kaskada/blob/main/CODE_OF_CONDUCT.md) before engaging with the community.
