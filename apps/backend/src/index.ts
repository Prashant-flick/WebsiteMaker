import express from "express";
import OpenAI from "openai";
import dotenv from 'dotenv'
import { getSystemPrompt } from "./lib/prompt";
import { reactInitPrompt } from "./defaults/react";
import { nodeInitPromots } from "./defaults/node";
import { allowedStack } from "./utils/constants";
import cors from 'cors'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
});

app.post('/init', async(req,res) => {
    const prompt = req.body.prompt;
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "given the prompt check it and give the proper answer with react or node, which is best suitable for the prompt, only give one word answer react or node , dont give any thing more"
            },
            {
                role: "user",
                content: prompt
            },
        ],
        model: "deepseek/deepseek-chat-v3-0324:free",
    });

    const isAllowedStack = allowedStack.find(stack => stack===completion.choices[0].message.content);
    if (isAllowedStack) {
        res.status(200)
        .json({
            message: isAllowedStack 
        })
        return;
    }
    
    res.status(400)
    .json({
        message: 'tech stack not allowed'
    })
})

app.post('/chat', async(req,res) => {
    const prompt = req.body.prompt;
    const initStack = req.body.initStack

    if (initStack==='react') {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: getSystemPrompt()
                },
                {
                    role: "user",
                    content: "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags."
                },
                {
                    role: "user",
                    content: `Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.${reactInitPrompt}Here is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n\n 
                    - also check IMPORTANT: Use coding best practices and split functionality into smaller modules instead of putting everything in a single gigantic file. Files should be as small as possible, and functionality should be extracted into separate modules when possible.
                    - Ensure code is clean, readable, and maintainable.
                    - Adhere to proper naming conventions and consistent formatting.
                    - Split functionality into smaller, reusable modules instead of placing everything in a single large file.
                    - Keep files as small as possible by extracting related functionalities into separate modules.
                    - Use imports to connect these modules together effectively.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "deepseek/deepseek-chat-v3-0324:free",
        });
    
        console.log(completion);
    
        res.status(200)
        .json(completion.choices[0].message.content);
    }else if(initStack==='node') {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: getSystemPrompt()
                },
                {
                    role: "user",
                    content: `Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.${nodeInitPromots}Here is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "deepseek/deepseek-chat-v3-0324:free",
        });
    
        console.log(completion);
    
        res.status(200)
        .json(completion.choices[0].message.content);
    }else {
        res.status(400)
        .json({
            message: 'wrong prompt or token limit reached'
        })
    }
})

app.listen(3000, () => {
    console.log("app is listening at port 3000");
})