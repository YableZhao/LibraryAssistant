# UT Library AI Assistant

An AI-powered chatbot designed to provide conversational and research assistance for university libraries. This assistant integrates multiple AI models (Google Gemini, OpenAI, Perplexity AI) and a Retrieval Augmented Generation (RAG) system to deliver comprehensive information access, document analysis, and research support.

## Key Features

- **Multi-Model AI Chat:** Dynamically switch between different AI models (Gemini, OpenAI, Perplexity AI) for diverse query responses.
- **Retrieval Augmented Generation (RAG):** Upload text files or provide URLs to build a knowledge base for context-aware, factual answers from your documents.
- **Responsive User Interface:** Modern, intuitive, and responsive chat interface built with React, ensuring a seamless experience across desktop, tablet, and mobile devices.
- **Speech-to-Text Input:** Dictate queries using browser-based speech recognition for hands-free interaction.
- **Persistent Knowledge Base:** Utilizes ChromaDB for persistent storage of RAG embeddings, ensuring data is retained across sessions.
- **Containerized Deployment:** Fully containerized with Docker and Docker Compose for easy setup, deployment, and scalability.

## Architecture Overview

The application follows a microservices-inspired architecture orchestrated by Docker Compose:

- **`frontend` Service:** A React-based single-page application, served by Nginx. Handles user interactions, model selection, and file uploads.
- **`backend` Service:** A Node.js (Express.js) application serving as the API gateway. It interfaces with external AI model APIs and manages the RAG service.
- **`chromadb` Service:** A dedicated ChromaDB vector database server for persistent storage and retrieval of embeddings for the RAG system.

## Technical Stack

- **Frontend:** React, JavaScript (ES6+), HTML5, CSS3
- **Backend:** Node.js, Express.js
- **AI Model APIs:** Google Gemini API, OpenAI API, Perplexity AI API
- **Vector Store (RAG):** ChromaDB (HTTP server mode)
- **Containerization:** Docker, Docker Compose
- **Web Server (Frontend):** Nginx
- **Development Tools:** npm, Git

## Project Structure

```
/Users/yable/Projects/LibraryAssistant/
├── backend/                    # Node.js backend service
│   ├── Dockerfile              # Dockerfile for the backend
│   ├── .env.example            # Example environment file
│   ├── src/
│   └── package.json
├── src/                        # React frontend application
│   ├── components/
│   │   └── ChatInterface.jsx   # Main chat component
│   ├── services/
│   │   └── aiService.js        # Frontend service to call backend APIs
│   └── ...
├── Dockerfile                  # Dockerfile for the frontend (multi-stage with Nginx)
├── docker-compose.yml          # Docker Compose configuration for all services
├── nginx.conf                  # Nginx configuration template
├── docker-entrypoint.sh        # Entrypoint script for frontend Nginx container
├── README.md                   # This file
└── package.json                # Frontend dependencies
```

## Getting Started

This section guides you through setting up and running the UT Library AI Assistant on your local machine using Docker. Docker is recommended as it simplifies dependency management and ensures a consistent environment across different systems.

### Prerequisites

Before you begin, ensure you have the following software installed on your system:

1.  **Docker Engine:** This is the core Docker software that allows you to build and run containers.
    *   **Why:** Docker isolates the application and its dependencies into containers, making it portable and reproducible.
    *   **Installation:** Download from [Docker's official website](https://docs.docker.com/get-docker/). Follow the instructions for your operating system (Windows, macOS, or Linux).

2.  **Docker Compose:** This tool is used for defining and running multi-container Docker applications. It reads a `docker-compose.yml` file to configure the application's services.
    *   **Why:** Our application consists of multiple services (frontend, backend, database). Docker Compose makes it easy to manage them together.
    *   **Installation:** Docker Compose is typically included with Docker Desktop for Windows and macOS. For Linux, you may need to install it separately. Refer to the [Docker Compose installation guide](https://docs.docker.com/compose/install/).

3.  **Git:** Required for cloning the project repository from its source code hosting platform (e.g., GitHub, GitLab).
    *   **Why:** To get a copy of the project files.
    *   **Installation:** Download from [git-scm.com](https://git-scm.com/downloads).

4.  **API Keys for AI Services:**
    *   **Why:** The assistant relies on external AI models. You'll need to obtain API keys from the respective providers to enable these features.
    *   **Services:**
        *   OpenAI (for GPT models)
        *   Google AI Studio (for Gemini models)
        *   Perplexity AI
    *   **Action:** Sign up on their platforms and generate the necessary API keys. Keep these keys confidential.

### Configuration

Proper configuration is crucial for the application to connect to AI services and for its internal components to communicate.

1.  **Clone the Repository:**
    If you haven't already, open your terminal or command prompt and clone the project repository to your local machine:
    ```bash
    git clone <your-repository-url> # Replace <your-repository-url> with the actual URL
    cd LibraryAssistant             # Navigate into the cloned project directory
    ```

2.  **Set Up Backend Environment Variables:**
    The backend service requires environment variables to store sensitive information like API keys and configuration details.

    *   **Navigate to the `backend` directory:**
        ```bash
        cd backend
        ```

    *   **Create a `.env` file:**
        The repository includes an example environment file named `.env.example`. You need to copy this file to create your own `.env` file. This file is gitignored, so your secret keys won't be accidentally committed to version control.
        ```bash
        cp .env.example .env
        ```

    *   **Edit the `.env` file:**
        Open the newly created `backend/.env` file in a text editor and provide your actual API keys and verify other settings:
        ```ini
        # Port for the backend Node.js Express server to listen on *inside its container*.
        # This should match the port exposed in the backend's Dockerfile and the target port
        # in the Nginx proxy configuration within the frontend service's Nginx setup.
        PORT=5000

        # --- API Keys ---
        # Replace the placeholder text with your actual API keys.
        # Ensure they are enclosed in quotes if they contain special characters,
        # though it's generally good practice for all string values.
        OPENAI_API_KEY="your_actual_openai_api_key"
        GOOGLE_API_KEY="your_actual_google_gemini_api_key"
        PERPLEXITY_API_KEY="your_actual_perplexity_api_key"

        # --- Service URLs ---
        # URL for the ChromaDB vector store. This uses Docker's internal DNS to resolve
        # 'chromadb' to the IP address of the chromadb service container on port 8000.
        CHROMA_URL=http://chromadb:8000

        # (Add any other backend-specific environment variables here if needed in the future)
        ```
        **Important:** Save the file after editing. Do *not* commit your `.env` file to Git.

    *   **Return to the project root directory:**
        ```bash
        cd ..
        ```

### Running the Application with Docker

With Docker and Docker Compose installed and the `.env` file configured, you can now build and run the entire application.

1.  **Build and Start Services:**
    From the project root directory (`/Users/yable/Projects/LibraryAssistant/`), run the following command in your terminal:
    ```bash
    docker-compose up --build -d
    ```
    *   **`docker-compose up`**: This command starts and runs your entire multi-container application as defined in the `docker-compose.yml` file.
    *   **`--build`**: This flag tells Docker Compose to build the Docker images for your services (frontend, backend) before starting the containers. It's good practice to include this when running for the first time or after making changes to `Dockerfile`s or application code that requires a new image.
    *   **`-d` (detached mode)**: This flag runs the containers in the background and prints the new container names. Without `-d`, the logs from all services would stream to your terminal, and closing the terminal would stop the containers.

    This process might take a few minutes the first time as Docker downloads base images and builds your application images.

2.  **Verify Containers are Running:**
    You can check the status of your containers using:
    ```bash
    docker-compose ps
    ```
    Or, for more detail on all running Docker containers:
    ```bash
    docker ps
    ```
    You should see containers for `frontend`, `backend`, and `chromadb` listed as 'Up' or 'Running'.

3.  **Access the Application:**
    Once the containers are successfully running, open your preferred web browser and navigate to:
    [http://localhost:3000](http://localhost:3000)

    The frontend application, served by Nginx, should load. Nginx is configured to proxy API requests (e.g., to `/api/...`) from the frontend to the backend service running on port 5000 (as defined by `BACKEND_URL` in the `docker-compose.yml` for the frontend service).

### Troubleshooting Common Issues

*   **Port Conflicts:** If port 3000 (for the frontend) or 5000/8000 (internally for backend/ChromaDB, though these are container-internal and less likely to conflict externally unless you explicitly map them differently) are already in use on your host machine, `docker-compose up` might fail. Stop the conflicting service or change the host port mapping in `docker-compose.yml` (e.g., `"8080:3000"` to access the frontend on `http://localhost:8080`).
*   **API Key Issues:** If AI features aren't working, double-check that the API keys in `backend/.env` are correct and that the services are enabled on your API provider accounts.
*   **Docker Build Failures:** Check the output logs during the `docker-compose up --build` step for specific error messages. These often point to issues in a `Dockerfile` or missing dependencies.
*   **Service Not Starting:** Use `docker-compose logs <service_name>` (e.g., `docker-compose logs backend`) to view the logs for a specific service and diagnose issues.

### Stopping the Application

To stop all the running services defined in your `docker-compose.yml` and remove the containers:

1.  **Navigate to the project root directory** (if you are not already there).
2.  Run the command:
    ```bash
    docker-compose down
    ```
    *   This command stops and removes the containers, networks, and (by default) the default network created by `up`.
    *   **Named volumes** (like `chroma-data` for ChromaDB) are **not** removed by default with `docker-compose down`. This is to prevent data loss. If you want to remove the volumes as well (e.g., to start completely fresh), you can use `docker-compose down -v`.

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
[https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size
[https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App
[https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration
[https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment
[https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

[https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
