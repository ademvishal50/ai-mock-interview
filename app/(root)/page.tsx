'use server'
import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviewByUserId } from '@/lib/actions/general.action'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Page = async () => {
 
  const user = await getCurrentUser();

  
  
  const [userInterviews] = await Promise.all([
    await getInterviewByUserId(user!.id!),
  ]);

  const hasPastInterviews = userInterviews!.length > 0;

  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview-Ready with AI-Powered Pracitce & Feedback</h2>
          <p className='text-lg'>Practice on real interview questions & get instant feedback</p>
        </div>
        <Image src="/robot.png" alt= "robo-dude" width={400} height={400} className="max-sm:hidden"/>
      </section>
      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>
        <div className='interviews-section'>
          {
            hasPastInterviews ? (
              userInterviews?.map((interview)=>(
                <InterviewCard {...interview} key={interview.id}/>
              ))
            ):(
              <p>You haven&apos;t taken any interviews yet</p>
            )
          }
        </div>
      </section>
    </>
  )
}

export default Page