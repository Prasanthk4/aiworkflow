# AI Workflow Builder

A powerful visual workflow builder for AI/LLM applications. Create, test, and deploy AI workflows with an intuitive drag-and-drop interface.

## Features

- 🎨 Visual Workflow Builder
- 🤖 Multiple LLM Support (OpenAI, Deepseek, etc.)
- 💬 Interactive Chat Interface
- 🔗 Connectable Nodes
- 🚀 Real-time Execution
- 📝 Input/Output Management

## Live Demo

Visit the live demo at: [Your Vercel URL]

## Setup Instructions

### Frontend Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd ai-workflow-builder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
REACT_APP_BACKEND_URL=http://localhost:3002
```

4. Start the frontend:
```bash
npm start
```

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=3002
NODE_ENV=development
```

4. Start the backend:
```bash
node index.js
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the following environment variables in Vercel:
   - `REACT_APP_BACKEND_URL`: Your backend API URL

### Backend (Render.com - Free Tier)

1. Create a Render account at [render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: ai-workflow-backend (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   PORT=10000
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   OPENAI_API_KEY=your_api_key
   DEEPSEEK_API_KEY=your_api_key
   ```

6. Click "Create Web Service"

Your backend will be available at: `https://your-service-name.onrender.com`

**Important Notes about Render Free Tier:**
- The service spins down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds to respond
- 500 build minutes/month included
- Automatic HTTPS/SSL certificates
- Continuous deployment from GitHub

### Backend (Your preferred hosting)

1. Deploy the server directory to your preferred hosting (Heroku, DigitalOcean, etc.)
2. Set the environment variables:
   - `PORT`: Your preferred port (usually provided by the hosting service)
   - `NODE_ENV`: production

## Important Notes

- The backend needs to be hosted separately from the Vercel deployment
- Update the `REACT_APP_BACKEND_URL` in your Vercel environment to point to your hosted backend
- Make sure CORS is properly configured in the backend for your frontend domain

## Architecture

- Frontend: React, Material-UI, React Flow
- Backend: Node.js, Express
- State Management: React Context
- API Integration: Multiple LLM providers

## License

MIT License - Feel free to use this project for your own purposes.

## Support

For any questions or issues, please open a GitHub issue or contact [your contact info].
