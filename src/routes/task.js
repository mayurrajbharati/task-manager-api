const express = require('express');
const Task= require('./../models/task');
const auth = require('./../middleware/auth');
const router = new express.Router();



router.post('/tasks', auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        author: req.user._id,
    });
    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }    
})

router.get('/tasks', auth,async (req,res)=>{
    const match = {};
    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 ;
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
            }).execPopulate();
        if(!req.user.tasks){
            res.status(400).send();
        }
        res.status(200).send(req.user.tasks);
    }catch(e){
        res.status(500).send(e);
    }
})

router.get('/tasks/:id', auth,async (req,res)=>{
    try{
        const task= await Task.findOne({_id: req.params.id, author: req.user._id});
        if(!task){
            return res.status(404).send('No such task found');
        }
        res.status(200).send(task);
    }catch(e){
        res.status(500).send(e);
    }
})

router.patch('/tasks/:id', auth, async (req,res)=>{
    const allowedUpdates = ['description','completed'];
    const updates = Object.keys(req.body);
    const isValid = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({error: 'Invalid updates'});
    }
    try{
        const task = await Task.findOne({ _id: req.params.id, author: req.user._id})
        if(!task){
            return res.status(404).send({
                error: 'No such task found!'
            });
        }
        updates.forEach((update)=> task[update]=req.body[update]);
        await task.save();
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', auth,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, author: req.user._id});
        if(!task){
            return res.status(400).send({error: 'No such task!'});
        }
        res.send(task);
    }catch(e){
            res.status(500).send(e);
    }

})


module.exports = router;