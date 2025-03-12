# UT Austin Library AI Assistant

An AI-powered chatbot designed to provide conversational and research assistance for the University of Texas at Austin Library. This assistant integrates multiple AI models to deliver comprehensive information access and research support.

## Project Overview

The UT Library AI Assistant provides:
- Conversational question answering about library resources
- Research assistance with multiple AI models (OpenAI, Google Gemini, Perplexity)
- File upload capabilities for document analysis
- Voice recognition for hands-free interaction

## Architecture

The application follows a modular architecture:
- **Frontend**: React-based UI with component-based design
- **Backend**: Express.js server with API proxies for AI services
- **AI Service Layer**: Abstraction for multiple AI model integrations
- **Containerization**: Docker setup for deployment

## Getting Started

### Running with Docker (Recommended)

1. Clone the repository
2. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ```
3. Build and run with Docker Compose:
   ```
   docker-compose up --build
   ```
4. Access the application at http://localhost:3000

### Running Locally (Development)

#### Frontend
```
npm install
npm start
```
Access at http://localhost:3000

#### Backend
```
cd backend
npm install
npm start
```
Backend runs at http://localhost:5000

## Features

- Multi-model AI support
- Real-time conversation
- Research assistance
- Voice input capability
- File upload and analysis
- Model switching

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
