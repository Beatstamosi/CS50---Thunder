# Django Movie & TV Show Watchlist App

## Overview

This application allows users to search for movies and TV shows via different parameters, add content to their watchlist, view additional information, and leave ratings. Built with Django and Django Allauth, it provides a seamless user experience for managing entertainment content.

## Distinctiveness and Complexity

This project stands out from others in the course by integrating a diverse array of features that cater to user preferences and interactions. Key aspects of its distinctiveness include:

- **Dynamic Search Capabilities:** Users can search for movies and TV shows using multiple parameters, providing a tailored search experience. This allows users to find content quickly based on various criteria, such as genre, release date, and ratings.

- **Personalized Watchlist Management:** This app allows users to add or remove items from their personalized watchlist seamlessly. The watchlist management feature includes dynamic updates and user-specific ratings, enhancing user engagement and ownership of their viewing experience.

- **Intelligent Recommendations:** The app goes beyond basic content display by suggesting personalized dynamically loaded content.

- **Responsive and Adaptive Design:** The project is designed to be responsive, ensuring an optimal user experience across various devices, including desktops, tablets, and smartphones.

- **Enhanced User Interaction:** Features such as visual rating systems and sortable watchlist items offer users an engaging interface. Users can easily adjust ratings and see immediate visual feedback, making the app more intuitive and enjoyable to use.

### Complexity

The complexity of this project arises from several factors:

- **Integration of User Authentication:** Implementing user authentication with Django Allauth adds a layer of complexity. Ensuring secure user access and personalized experiences requires careful handling of sessions and user data.

- **Dynamic Content Management:** The application efficiently manages dynamic content updates through API requests. This requires careful orchestration of fetch calls, handling responses, and updating the UI in real-time, ensuring a smooth user experience.

- **API Integration:** The app utilizes external APIs for fetching content data, necessitating robust error handling and data management strategies. This integration allows the application to stay up-to-date with the latest movie and TV show information.

- **Complex State Management:** As users interact with their watchlist, ratings, and recommendations, the app must efficiently manage and reflect these changes in the UI. This requires a deep understanding of state management and how to manipulate the DOM effectively.

Overall, this project not only distinguishes itself from others in the course through its unique combination of features and functionalities but also presents a significant level of complexity in its design and implementation. This makes it a valuable learning experience and a solid foundation for future enhancements.


## File Descriptions

- **views.py:** Contains the backend logic for handling user requests, including search queries and watchlist management.
- **urls.py:** Defines URL patterns and connects them to the appropriate views.
- **models.py:** (Not shared) Should define the database schema for storing content and user ratings.
- **templates/**: Includes HTML files that render the app’s front end.
- **static/js/**: Contains the JavaScript files that manage interactivity, including:
- **main.js**: Manages the watchlist functionality, including toggling items and updating visibility based on user selections.
- **static/css/**: Contains stylesheets for the app’s layout and design.

## Installation and Setup

### Prerequisites

Ensure you have Python and pip installed. Clone the repository and install the required packages.

## Configuration

### Database Setup

Initialize Database by using the following commands:

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

### Django Allauth Configuration

Django Allauth is already configured in `settings.py` and in the `models.py` of the watchlist app.

### Static Files

Collect static files for deployment:

```bash
python manage.py collectstatic
```

## Running the Application

To run the application locally, use the following command:

```bash
python manage.py runserver
```

Visit http://127.0.0.1:8000/ in your web browser to access the application.

## Features

- **User Authentication:** Login and Signup using Django Allauth.
- **Search Functionality:** Search for movies and TV shows via various parameters.
- **Watchlist Management:** Add or remove content from the watchlist and manage user ratings.
- **Recommendations:** Dynamic recommendations based on user behavior.

## Usage

- **Searching for Content:** Use the search bar to find movies or TV shows.
- **Adding to Watchlist:** Click the "Add to Watchlist" button to save your favorite content.
- **Viewing Watchlist:** Access your watchlist to manage your saved content and ratings.
- **Sorting Options:** Sort your watchlist by user rating, TMDB rating, or alphabetically by title.


## Additional Information

This project is intended for educational purposes and may require further development for production use. For example, the API queries would need to be sped up, or the data could be stored in its own database for quicker access.
