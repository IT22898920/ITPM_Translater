const router = require("express").Router();
let Synonym = require("../models/synonym.js");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//add new one
router.route("/SynonymAdd").post((req,res)=>{
    
    const word = req.body.word;
    const synonym = req.body.synonym;
    const status = req.body.status;
    

    const newSynonym = new Synonym({
    word,
    synonym,
    status
    })


    newSynonym.save().then(()=>{
        res.json("synonym added")
    }).catch((err)=>{
        console.log(err);
    })

})

//view all
router.route("/synonymsTable").get((req,res)=>{
    Synonym.find().then((synonyms)=>{
        res.json(synonyms)
    }).catch((err)=>{
        console.log(err);
    })
})

// router.route("/synonymsSearch").get((req,res)=>{
//     Synonym.find().then((synonyms)=>{
//         res.json(synonyms)
//     }).catch((err)=>{
//         console.log(err);
//     })
// })


router.get("/synonymsSearch", async (req, res) => {
    try {
      const word = req.query.word; // Retrieve the word from the query parameter
  
      // Use Mongoose to find synonyms where the 'word' attribute matches the entered word
      const synonyms = await Synonym.find({ word: word });
  
      // Send the synonyms as a JSON response
      res.json(synonyms);
    } catch (err) {
      // Handle any errors and send an error response
      console.error(err);
      res.status(500).json({ error: "An error occurred while fetching synonyms." });
    }
  });

//read one
// router.route("/get/:id").get(async (req, res) => {
//     let InvID = req.params.id;
//     const inv = await Products.findById(InvID)
//     .then((Products) => {
//         res.status(200).send({status: "Products fetched" , Products})
//     }).catch(() => {
//         console.log(err.message);
//         res.status(200).send({status: "error with get Products" , error: err.message});
//     })
// })

router.route("/deleteSynonym/:id").delete(async (req,res) => {
    let sid = req.params.id;

    await Synonym.findByIdAndDelete(sid)
    .then(() => {
        res.status(200).send({status: "Synonym deleted"});
    }).catch((err) => {
        res.status(200).send({status: "Error with delete Synonym" , error: err.message});
    })
})


router.route('/updateSynonym/:id').put(async (req, res) => {
    try {
        const synonymID = req.params.id;
        const word = req.body.word;
        const synonym = req.body.synonym;
        const status = req.body.status;

        const updateSynonyms = {
            word,
            synonym,
            status
        };

        const updatedSynonym = await Synonym.findByIdAndUpdate(synonymID, updateSynonyms, { new: true });

        if (!updatedSynonym) {
            return res.status(404).json({ error: 'Synonym not found' });
        }

        res.status(200).json({ status: 'Synonym updated', synonym: updatedSynonym });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error with updating data', message: err.message });
    }
});


module.exports = router;
