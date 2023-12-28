/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// server.mjs
import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4440;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());
let db;

const connectToDatabase = async () => {
  try {
    const client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db('Bmi');
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
};

connectToDatabase();

// User registration
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection('users').insertOne({ email, password: hashedPassword });

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error registering user', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/',(req,res)=>{
  res.send("App Is Working Fine")
})

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in user', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// BMI calculation
app.post('/api/calculate-bmi', async (req, res) => {
  const { weight, height } = req.body;

  // Implement BMI calculation logic
  const bmiValue = calculateBMI(weight, height);

  res.json({ bmi: bmiValue });
});

function calculateBMI(weight, height) {
  // Implement your BMI calculation logic here
  // Formula: BMI = weight (kg) / (height (m) * height (m))
  return weight / (height * height);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
