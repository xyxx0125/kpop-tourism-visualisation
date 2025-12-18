# K-pop Popularity and Tourism to South Korea
## Interactive Data Visualisation using D3.js

## Overview
This project presents an interactive data visualisation analysing the relationship between global K-pop popularity and international tourism flows to South Korea. The analysis examines whether countries with higher levels of K-pop cultural attention also demonstrate higher numbers of visitors to South Korea when tourism is normalised by population size. Using per-capita metrics enables meaningful cross-country comparison and reduces bias introduced by absolute population differences.

The visualisation is implemented as a client-side web application using D3.js and integrates multiple coordinated views to support exploratory analysis.

## Research Question and Hypothesis
**Research question:**  
To what extent is international tourism to South Korea associated with the global popularity of K-pop?

**Hypothesis:**  
Countries with higher levels of K-pop attention tend to send more visitors to South Korea per 100,000 population.

## Data and Method
The project combines country-level data on:
- K-pop attention (digital cultural popularity index)
- Tourism arrivals to South Korea
- National population figures
- Derived metric: visitors per 100,000 population

Tourism figures are normalised by population to ensure cross-national comparability. A logarithmic scale is applied where appropriate to address skewed distributions in tourism flows.

## Visual Components
The application includes four interactive visualisations:
1. Scatter plot showing K-pop attention versus visitors per 100,000 population with a fitted trend line.
2. Global choropleth map displaying the distribution of K-pop attention.
3. Proportional symbol map showing per-capita visitor intensity.
4. Event-based comparison chart highlighting countries with notable K-pop milestones.

All visualisations include tooltips and responsive layout behaviour.

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6)
- D3.js (v7)
- TopoJSON

The project runs entirely client-side and requires no build tools or server environment.

## Repository Structure
kpop-tourism-visualisation/
├── index.html
├── script.js
├── styles.css
├── data
      ── data.csv
└── README.md

## How to Run
1. Clone or download the repository.
2. Open `index.html` in a modern web browser (Chrome, Firefox, or Edge).

## Scope and Limitations
The visualisation supports exploratory analysis and does not establish causal relationships. K-pop attention is used as a proxy for cultural influence and may not capture other drivers of tourism such as policy constraints, economic conditions, or external shocks.

## Academic Context
This project was developed as part of an academic data visualisation exercise and demonstrates the use of interactive graphics to analyse cross-national cultural and tourism data.
