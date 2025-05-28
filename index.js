const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.off1efx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const jobsCollection =client.db("carrerDB").collection("jobs")
    const applicationsCollection =client.db("carrerDB").collection("applications")

    // jobs api 
    app.get('/jobs',async(req,res)=>{
        const result =await jobsCollection.find().toArray()
        res.send(result)
    })

    // specefic id call 
    app.get('/jobs/:id',async(req,res)=>{
      const id=req.params.id;
      const query ={_id: new ObjectId(id)};
      const result =await jobsCollection.findOne(query);
      res.send(result)
    })

    // application apis 
    app.post('/applications',async(req,res)=>{
      const user =req.body;
      // console.log(user)
      const result =await applicationsCollection.insertOne(user);
      res.send(result)
    });
    app.get("/applications",async(req,res)=>{
      const email =req.query.email;
      const query ={
        applicant:email
      }
      const result =await applicationsCollection.find(query).toArray();

      // bad way 
      for(const application of result ){
        const jobId =application.jobId;
        const jobQuery ={_id: new ObjectId(jobId)}
        const job =await jobsCollection.findOne(jobQuery)
        application.company=job.company;
        application.title=job.title;
        application.company_logo =job.company_logo;
      }
      res.send(result)
    })
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("carrer code job portal getting the server");
});

app.listen(port, () => {
  console.log(`server is getting start at:${port}`);
});
