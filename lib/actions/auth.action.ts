/* eslint-disable */
"use server";

import { db,auth } from "@/firebase/admin";
import { cookies } from "next/headers";
import { getInterviewById } from "./general.action";

const ONE_WEEK = 60 * 60 * 24 * 7;
export async function signUp(params: SignUpParams) {
    const {uid, name, email} = params;
    try{
        const userRecord = await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return {
                success: false,
                message: 'User already exists. Please sign in instead.'
            }
        }
        await db.collection('users').doc(uid).set({
            name, email
        })

        return {
            success: true,
            message:"Account created successfully. Please sign in."
        }
    }catch (e: any){
        console.error("Error creating a user", e);
        if(e.code === 'auth/email-already-exists'){
            return{
                success:false,
                message:'This email is already in use.'
            }
        }

        return{
            success: false,
            message:'Failed to create an account'
        }
    } 
}



export async function signIn(params: SignInParams) {
    const {email, idToken} = params;

    try{
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){
            return{
                success:false,
                message: 'User does not exist. Create an account instead.'
            }
        }
        await setSessionCookie(idToken);
    }catch(e){

        console.log(e);

        return{
            success:false,
            message:'Failed to log into an account.'
        }   
    }
}

export async function signOut() {
  try {
    console.log("Signing out user...");
    
    const cookieStore = await cookies();
    cookieStore.delete("session");     

    return {
      success: true,
      message: "Signed out successfully.",
    };
  } catch (e) {
    console.error("Sign out error:", e);
    return {
      success: false,
      message: "Failed to sign out.",
    };
  }
}


export async function setCompletedInterview(interviewId: string) {

 
    try{
        const interview = await getInterviewById(interviewId!);
        interview!.completed = true;
        await db.collection('interviews').doc(interviewId!).set(interview!);
        return {
            success: true,
            message:"Interview marked as completed."
        }
    }catch (e: any){
        console.error("Error marking interview as completed", e);

        return{
            success: false,
            message:'Error marking interview as completed'
        }
    } 
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000,
    })

    cookieStore.set('session',sessionCookie,{
        maxAge:ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: '/',
        sameSite: 'lax'
    })
    
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if(!sessionCookie) return null;

    try{
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord =await db.collection('users').doc(decodedClaims.uid).get();
        if(!userRecord.exists) return null;
        return{
            ...userRecord.data(),
            id: userRecord.id,
        } as User

    }catch(e){
        console.log(e);
        return null;
    }
}

export async function getAdminUser(): Promise<Admin | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if(!sessionCookie) return null;

    try{
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        // Check for custom claim
        if (decodedClaims.admin === true) {
            // Optionally fetch admin profile from Firestore if needed
            return {
                id: decodedClaims.uid,
                email: decodedClaims.email,
                // ...other fields if needed
            } as Admin;
        }
        return null;
    }catch(e){
        console.log(e);
        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user; 
}

export async function isAdminAuthenticated() {
    const admin = await getAdminUser();
    return !!admin; 
}