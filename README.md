# Architect

## Authors

- James Gabriel Goudie
- Patricia Lee
- Radu Laudat

## Summary

Architect is an application to design structures in a 3D environment.
The application will be a website that can run in the browser.
Users can work together and share projects.

## Features for Beta Version

- Allow users to create basic structures using a suite of tools
- Users can navigate the 3D environment by controlling the camera
- Users can download their constructs or save them on a cloud service such as a
    personal Google Drive
- Allow for teams of designers so that users with accounts can work together
    simultaneously

## Additional Features for Final Version

- Expand on editor functionality
- Improve synchronise useage
- Implement users and teams to easily control how users work togther

## Technology Used

- The core of the frontend (interacting with 3D objects and navigation) will
    be implemented with three.js
- The frontend application will be constructed using Angular and will follow a
    modular approach
- A GraphQL API following CRUD will be used to define how the frontend can
    interact with the backend
- The backend will be constructed using NodeJs written in TypeScript which will
    handle authentication and interacting with the database
- All of the data will be stored in a PostgreSQL database which will have
    tables for users, teams, and workspaces

## Technical Challenges

1. Allowing users to work on the same project simultaneously
2. Using three.js to allow users to navigate and create constructs
3. Designing constructs in a way that they can be saved and retrieved
4. Handling authentication with GraphQL
5. Interacting with the Google Drive API so that users can save projects
