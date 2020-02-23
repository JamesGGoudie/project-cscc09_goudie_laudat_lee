# Architect

## Authors

- James Gabriel Goudie
- Radu Laudat
- Patricia Lee

## Summary

Architect is an application to design buildings in a 3D environment.
The application will be a website that can run in the browser.
Users can work together and share projects.

## Features for Beta Version

- Allow users to create basic buildings using a suite of tools
- Users can navigate the 3D environment by controlling the camera
- Users have the option of creating an account to access additional features
- Users with an account can store a limited amount of constructs on the server
- Users can download their constructs or save them on a cloud service such as a
    personal Google Drive

## Additional Features for Final Version

- Allow for teams of designers so that users with accounts can work together
    simultaneously
- Users with accounts can share constructs with specific users with accounts
- Users with accounts can publish their constructs to a shared library
- Users will have access to all published constructs to import into their own
    projects
- Track stats on published constructs such as downloads

## Technology Used

- The core of the frontend (interacting with 3D objects and navigation) will
    be implemented with three.js
- The frontend application will be constructed using Angular and will follow a
    modular approach
- A REST API following CRUD will be used to define how the frontend can
    interact with the backend
- The backend will be constructed using Spring Boot which will handle
    authentication and interacting with the database
- All of the data will be stored in a PostgreSQL database which will have
    tables for users, constructs, and teams

## Technical Challenges

1. Allowing users to work on the same project simultaneously
2. Using three.js to allow users to navigate and create constructs
3. Designing constructs in a way that they can be saved and retrieved
4. Handling authentication with Spring Boot
5. Interacting with the Google Drive API so that users can save projects
