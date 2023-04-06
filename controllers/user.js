import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

import User from "../models/user.js";

export const signIn = async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
    const {email , password} = req.body;

    try {
        const existingUser = await User.findOne({email});

        if(!existingUser) return res.status(404).json({message:"User does not exist"})

        const isPasswordCorrect = await bcrypt.compare(password ,existingUser.password);

        if(!isPasswordCorrect) return res.status(404).json({message:"Invalid Credentials"})

        const token = jwt.sign({email:existingUser.email,id:existingUser._id},'secret-key', {expiresIn: '3h'})

        res.status(200).json({result:existingUser , token})

    } catch (error) {
        res.status(500).json({message:"Something went wrong!"})
    }
}

export const signUp= async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  const {email , password , firstName , lastName , confirmPassword} = req.body;

  try {
    const existingUser = await User.findOne({email});

    if(existingUser) return res.status(404).json({message:"User Already exist"})

    if(password !== confirmPassword) return res.status(404).json({message:"password don't match"})

    const hashedPassword = await bcrypt.hash(password ,12 );

    const result = await User.create({email,password:hashedPassword , name: `${firstName} ${lastName}`})
    
    const token = jwt.sign({email:result.email,id:result._id},'secret-key', {expiresIn: '3h'})
    console.log(token)
    res.status(200).json({result, token})
  } catch (error) {
    res.status(500).json({message:"Something went wrong!"})
  }
}