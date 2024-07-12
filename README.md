
# Data Dashboard using D3 and React


## Overview

This project is a data visualization dashboard built using D3.js and React.js. It provides a comprehensive view of [describe what your dashboard is visualizing, e.g., sales data, user analytics, etc.].

## Features

- **Interactive Charts**: Utilizes D3.js for creating interactive and dynamic charts.
- **Data Filtering**: Allows users to filter data based on various parameters.
- **Responsive Design**: Designed to work seamlessly across different screen sizes and devices.
- **Customizable Widgets**: Easily configurable widgets to display key metrics.

## Installation

Due to removed private data, this project cannot be run locally. However, you can still explore the source code and adapt it for your needs.

## Screenshots
First, you can see users have the option to add data views by source (survey questions versus characteristics), and modify the data included by year. They can also choose if the data is represented in percentages or counts, and specify AND versus OR based filtering when filtering by responses (Any versus All).

<img width="1440" alt="data dash filters" src="https://github.com/user-attachments/assets/59903fc9-3dc2-4660-ab6b-80dff8ef6d84">

Integrated in the dashboard is one correlogram-heatmap hybrid graph, where users can choose which x and y fields they'd like to display. The component will then decipher if the relationship between these variables is significant by performing a chi-squared test. 

<img width="1439" alt="data dash dot plot" src="https://github.com/user-attachments/assets/fb75e9f9-048f-4fe9-a951-e55bbd5eea7e">

Underneath is the graphs that the user selected, with a distinction of the source (survey questions versus characteristics). None of the graphs have been filtered yet. The user can also toggle between 3 graph types for each visual.

<img width="1440" alt="data dash bars unfiltered" src="https://github.com/user-attachments/assets/c5ed1764-c027-45da-9dfc-ac78da3b6ce9">

<img width="1440" alt="data dash customize view" src="https://github.com/user-attachments/assets/386b2728-1b5a-4c5d-9383-3356d0a361db">

Here is the same dashboard when a user clicks a bar to filter across all data with that response:

<img width="1440" alt="data dash 1 filter" src="https://github.com/user-attachments/assets/734c3b8a-6cf8-46e9-b740-1c3d01042b65">

And again filtering using AND with another response. You can also see that each element imn a graph has a tooltip for more precise information:

<img width="1430" alt="data dash multiple filters, tooltip" src="https://github.com/user-attachments/assets/6e0a087a-d3f5-4664-9e82-acc9248172a0">


## Usage

- **Data Integration**: Replace sample data with your own data sources in the `data` folder.
- **Customization**: Modify components and styles in `src/components` and `src/styles` to fit your specific needs.

## Contributing

Contributions are welcome! If you find any issues or have suggestions, feel free to open an issue or create a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
