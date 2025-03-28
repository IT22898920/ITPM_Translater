const router = require("express").Router();
let Antonym = require("../models/antonym.js");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

//add new one
router.route("/AntonymAdd").post((req,res)=>{
    
    const word = req.body.word;
    const antonym = req.body.antonym;
    const status = req.body.status;
    

    const newAntonym = new Antonym({
    word,
    antonym,
    status
    })


    newAntonym.save().then(()=>{
        res.json("antonym added")
    }).catch((err)=>{
        console.log(err);
    })

})

//view all
router.route("/antonymTable").get((req,res)=>{
    Antonym.find().then((antonym)=>{
        res.json(antonym)
    }).catch((err)=>{
        console.log(err);
    })
})


router.get("/antonymSearch", async (req, res) => {
    try {
      const word = req.query.word; // Retrieve the word from the query parameter
  
      // Use Mongoose to find synonyms where the 'word' attribute matches the entered word
      const antonym = await Antonym.find({ word: word });
  
      // Send the antonym as a JSON response
      res.json(antonym);
    } catch (err) {
      // Handle any errors and send an error response
      console.error(err);
      res.status(500).json({ error: "An error occurred while fetching antonym." });
    }
  });


router.route("/deleteAntonym/:id").delete(async (req,res) => {
    let sid = req.params.id;

    await Antonym.findByIdAndDelete(sid)
    .then(() => {
        res.status(200).send({status: "Antonym deleted"});
    }).catch((err) => {
        res.status(200).send({status: "Error with delete antonym" , error: err.message});
    })
})


router.route('/updateAntonym/:id').put(async (req, res) => {
    try {
        const antonymID = req.params.id;
        const word = req.body.word;
        const antonym = req.body.antonym;
        const status = req.body.status;

        const updateAntonyms = {
            word,
            antonym,
            status
        };

        const updatedAntonym = await Antonym.findByIdAndUpdate(antonymID, updateAntonyms, { new: true });

        if (!updatedAntonym) {
            return res.status(404).json({ error: 'antonym not found' });
        }

        res.status(200).json({ status: 'antonym updated', antonym: updatedAntonym });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error with updating data', message: err.message });
    }
});


module.exports = router;
