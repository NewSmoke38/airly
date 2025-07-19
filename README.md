# Airly

Airly is a image-based social media webapp where people can share posts, like and comment on posts, and discover popular posts through a smart ranking algorithm. 

It's built as a full-stack webapp with a clean, minimal design that has a scalable backend.

# Why I Built This! 

i built this as my first full-stack webapp project with a strong focus on writing a good backend and for learning backend in nodejs. 

this kinda project enabled me to explore aggeregation piplines and other intermidiate stuff in backend!

also i made this as a project for athena award, a you ship we ship (YSWS) in Hack Club.


# Tech Stack - (Why each technology/approach was chosen)

**Backend** -> i chose javascript (NodeJS) for the whole backend of this project because i am now very much fluent with it + its very developer friendly!

now for the technical part of it, i chose MongoDB Atlas as the database because again it is developer friendly and easy to use. 

i wanted to use and focus on a denormalized approach for data keeping (models) for fast performance and not so much on perfect data structuring..

also it doesnt require structuring like SQL DBs just documents! or customizing anything(until you want to) and that is where it wins! 

and for the image storing part, i took cloudinary as a part of my backend cause again its free for me as of now and works prettty well without burning my time!

for some real tasks which are used in literally every file, i have made a utils folder for recurring API responses for a consistent response format, API errors and the OG async handler for reusablity of it (NodeJS wins here)! - also this is really good practice!

i added a new thing i learned while making htis project which was databse indexing so included it too although very much of it can actually slow up stuff. its fast for some stuff like strategic indexing for quiries.

deployed backend on Railway cause it gives unlimited repos to be deployed on my prized account for which i'll pay and ditched Render cause it took money for each project repo demn
---
**Frontend** -> i used React with TypeScript for the frontend and build tool Vite  because i wanted to learn TypeScript and again it provides better developer experience! 

for styling, i picked Tailwind CSS because it lets us make modern UIs (mine was inspired by pinterest dashbaord) super quickly without writing custom CSS.

and for state management, i used Redux toolkit. i also added localStorage persistence so user sessions survive page refreshes, which is crucial for a good UX. in routing i used the OG react router DOM!

for UI components, i went with Lucide React for icons because they're beautiful.

organized code into clear folders (auth, layout, modals, pages) with proper error handling for performance and clean code strucutre.

deployed the frontend on Vercel because it's great for frontend, plus it's free for personal projects!!

# Learnings

Full-stack development, modern JS/TS, React ecosystem, API integration,

Deploying on a various places (cause i tried AWS Elastic Beanstalk(expensive/), DigitalOcean(takes money for each project/), Render(per-service billing/), Railway) but then finally took Railway as the main home for my backend!

- **Challenges i somehow overcame** - CORS, file uploads, deploying(real mind bending!)


##  **Some cool Backend things i enjoyed**

### **1. Popular Posts Algorithm**

The popular posts feature implements a algorithm like a ranking system that goes far beyond simple "most liked" sorting. Instead of just counting likes, this algorithm creates a **engagement score** that considers the quality and type of user interaction.

How the Algorithm Works: we decide stuff on basis of these things -
- Likes (2x weight)
- Comments (1x weight)
- Views (0.5x weight)
- Recency factor - When scores are tied, newer posts get slight preference to keep content fresh. 

imagine a post with 10 likes and 5 comments might rank higher than one with 20 likes but no comments. (yes this is an algorithmm)

This algorithm uses MongoDB's aggregation pipeline thingy to calculate scores(likes, comments) in real-time. 

---

### **2. Text indexing advance search across multiple fields**

multi-field text indexing is something so cool that it takes out stuff out of a mess of data to a request made by a user - that provides intelligent, context-aware search results.

 This goes far beyond simple keyword matching to deliver relevant and fast results across different types of content.

---


### AI usage

i used AI tools strategically and minimally throughout the frontend part of this  project, mainly for learning and problem solving. 

for the frontend, i occasionally used AI to help understand complex TypeScript patterns and React best practices when i got stuck. also the masonary structure (the brick like strucutre of the posts) for a pinterest like look was hard to implement so there i brainstormed with ai to find ways of implementing that idea.

the search functionality in the backend uses MongoDB's built-in text indexing and regex matching but i got stuck there so took help there.

ai helped me learn faster and solve specific problems, but the logic, flow and the architecture, algorithms, and implementation are all my own work. 

---

## Contributing to Airly!


### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/NewSmoke38/airly
cd airly
```

#### 2. Backend Setup
```bash
cd Backend
npm install           

#  create your own .env file manually

npm run dev
```

#### 3. Frontend Setup
Open a new terminal window/tab:
```bash
cd frontend
npm install           

 # create your own .env manually, mostly only for the backend url!

npm run dev
```
---

#### testing the backend 
- Use [Postman](https://www.postman.com/) to test API endpoints.
- Use the browser to test the frontend UI and flows.


