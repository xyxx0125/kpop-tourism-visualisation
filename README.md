K-pop Popularity and Tourism to South Korea
Interactive Data Visualisation using D3.js
Overview

This project presents an interactive data visualisation examining the relationship between global K-pop popularity and international tourism flows to South Korea. The analysis focuses on whether higher levels of K-pop cultural attention are associated with higher numbers of visitors to South Korea when tourism is normalised by population size. By using per-capita visitor metrics, the project enables meaningful cross-country comparison and avoids bias introduced by absolute population differences.

The visualisation is implemented as a browser-based application using D3.js and integrates multiple coordinated views to support exploratory analysis.

Research Question and Hypothesis

Research question:
To what extent is international tourism to South Korea associated with the global popularity of K-pop?

Hypothesis:
Countries with higher levels of K-pop attention tend to send more visitors to South Korea per 100,000 population.

Data and Method

The project combines country-level data on:

K-pop attention (digital cultural popularity index)

Tourism arrivals to South Korea

National population figures

Derived metric: visitors per 100,000 population

Tourism figures are normalised by population to ensure comparability across countries. A logarithmic scale is applied where necessary to manage skewed distributions.

Visual Components

The application includes four interactive visualisations:

Scatter plot showing K-pop attention versus visitors per 100,000 population, with a fitted trend line.

Global choropleth map displaying the spatial distribution of K-pop attention.

Proportional symbol map showing per-capita visitor intensity.

Event-based comparison chart highlighting countries with notable K-pop milestones.

All charts include tooltips and responsive layout behaviour.

Technologies Used

HTML5

CSS3

JavaScript (ES6)

D3.js (v7)

TopoJSON

The project runs entirely client-side and requires no build tools or server environment.

Repository Structure
kpop-tourism-visualisation/
├── index.html
├── script.js
├── styles.css
├── data.csv
└── README.md

How to Run

Clone or download the repository.

Open index.html in a modern web browser (Chrome, Firefox, or Edge).

Scope and Limitations

The visualisation supports exploratory analysis and does not establish causal relationships. K-pop attention is used as a proxy for cultural influence and may not capture all drivers of tourism, such as policy, economic conditions, or travel constraints.

Academic Context

This project was developed for an academic data visualisation exercise and demonstrates the use of interactive graphics to analyse cross-national cultural and tourism data.
