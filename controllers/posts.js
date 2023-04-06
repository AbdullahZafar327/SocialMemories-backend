import mongoose from "mongoose";
import postMessage from "../models/postMessage.js"
//post get request route
export const getPosts = async (req,res)=> {
  res.setHeader('Access-Control-Allow-Origin','*')
  const {page} = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page)-1) *LIMIT;
    const total = await postMessage.countDocuments({});
    const posts = await postMessage.find().sort({_id:-1}).limit(LIMIT).skip(startIndex);
    res.status(200).json({data:posts , currentPage:Number(page),numberOfPages:Math.ceil(total/LIMIT) })
  } catch (error) {
    res.status(404).json({message: error.message})
  }
}

export const getPostsBySearch = async(req,res) => {
  res.setHeader('Access-Control-Allow-Origin','*')
   const {searchQuery,tags} = req.query;
   try {
      const title = new RegExp(searchQuery,'i') ; //i means ignore letter case
      const posts = await postMessage.find({$or:[{title},{tags:{$in:tags.split(',')}}]})
      
      res.status(200).json({data:posts})
   } catch (error) {
      res.status(404).json({message:error.message})
   }
}

export const getPost = async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  const{id} = req.params;
  try{
    const post = await postMessage.findById(id);
    res.status(200).json({data:post})

  }catch(error){
    res.status(400).json({message:error.message})
  }
}

//Post creation route
export const createPost = async (req,res) =>{
  res.setHeader('Access-Control-Allow-Origin','*')
  const post = req.body;
  
  const newPost = new postMessage({...post,creator:req.userId,createdAt:new Date().toISOString()})
  console.log(newPost)
  try {

    await newPost.save();

    res.status(204).json(newPost)

  } catch (error) {
    res.status(409).json({message: error.message})
  }
}

//post update route
export const updatePost = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*')
  const { id } = req.params;
  const { title, message, creator, selectedFile, tags } = req.body;

  try {

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
      
        const updatedPost = { creator, title, message, tags, selectedFile, _id: id };
      
        await postMessage.findByIdAndUpdate(id, updatedPost, { new: true });
      
        res.json(updatedPost);

  }
  catch (error) {
        res.status(400).json({message:error.message})
  }

}

export const deletePost  = async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  const { id } = req.params;
  try {
     if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json(`No Post with that id`)
     await postMessage.findByIdAndDelete(id)
     res.json({message:'post deleted Successfully'})
  } catch (error) {
    res.status(404).json(error)
  }
} 

export const likePost = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*')
  const { id } = req.params;
    if(!req.userId) return res.json({message:'unauthenticated'})

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
  
  const post = await postMessage.findById(id);

  const index= post.likes.findIndex((id)=> id===String(req.userId))

  if(index === -1) {
        post.likes.push(req.userId)
  }else{
     post.likes = post.likes.filter((id)=> id !== String(req.userId))
  }

  const updatedPost = await postMessage.findByIdAndUpdate(id, post, { new: true });
  
  res.json(updatedPost);
}

export const commentPost = async (req,res) =>{
  res.setHeader('Access-Control-Allow-Origin','*')
  const {id} = req.params;
  const {value} = req.body;

  try {
    const post = await postMessage.findById(id);

    post.comments.push(value);

    const updatedPost = await postMessage.findByIdAndUpdate(id,post,{new:true})

    res.status(200).json(updatedPost)

  } catch (error) {
    res.status(400).json({message:error.message})
  }
}