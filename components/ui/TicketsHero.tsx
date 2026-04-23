"use client";

import {  BarChart3, Mail,  Ticket } from "lucide-react";
import Image from "next/image";
import NubButton from "@/components/ui/NubButton";

export default function TicketingHero() {
  return (
    <section className="relative min-h-screen bg-white flex flex-col items-center pt-32 pb-20 px-4 md:px-8 overflow-hidden text-black">
      
      {/* Floating Elements (Background) */}
      <div className="absolute top-100 left-10 md:left-70">
         <div className="w-18 h-18 ">
            <Image src="/icons/start.svg" alt="Start" width={109} height={109} />
         </div>
      </div>
      <div className="absolute top-118 left-10 md:left-90">
         <div className="w-18 h-18 ">
            <Image src="/icons/arrow_circled.png" alt="Start" width={109} height={109} />
         </div>
      </div>
      
      <div className="absolute top-40 right-10 md:right-40 animate-pulse">
         <div className="w-10 h-10 bg-black text-white rounded-full  flex items-center justify-center shadow-lg">
             <BarChart3 size={18} />
         </div>
         <div className="absolute -bottom-12 -right-8 w-12 h-12 bg-[#D1F366] rounded-full  flex items-center justify-center opacity-50 blur-xl" />
      </div>

      {/* Header Section (Outside Grid) */}
      <div className="text-center max-w-4xl mx-auto mb-12 relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          Optimization for your <br/>
          <span className="relative inline-block">
             Events & Revenue
             <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#D1F366] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5 V 10 H 0 Z" fill="currentColor" />
             </svg>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Choose efficiency and profitability for your organization. 
          Zero fees and complete data ownership will lead to improved sales, 
          fan loyalty, and higher business results.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 items-stretch">
        
        {/* Left Card: Mission (Tall Left) */}
        {/* Order: Mobile 2, Desktop 1 */}
        <div className="order-2 md:order-1 col-span-1 md:col-span-3 rounded-4xl relative overflow-hidden w-full group flex flex-col min-h-[500px] md:min-h-[600px]">
           <Image 
             src="/artifacts/tallcardbg.png" 
             alt="Background" 
             fill
             className="object-cover absolute"
           />
           
           <div className="relative z-10 h-full p-8 md:p-10 flex flex-col justify-end gap-4 pb-20 md:pb-10">
             <div className="w-full">
                 <svg 
                    width="120" 
                    height="20" 
                    viewBox="0 0 426 38" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#244816]"
                 >
                    <path fillRule="evenodd" clipRule="evenodd" d="M402.933 31.0374C402.587 31.3549 402.31 31.7379 402.118 32.1634C401.926 32.5889 401.823 33.0482 401.814 33.514C401.806 33.9797 401.893 34.4423 402.07 34.8743C402.247 35.3062 402.51 35.6985 402.844 36.0279C403.177 36.3573 403.575 36.617 404.013 36.7914C404.451 36.9659 404.919 37.0516 405.392 37.0434C405.864 37.0351 406.329 36.9332 406.76 36.7436C407.192 36.554 407.58 36.2807 407.902 35.9399L423.141 20.9086L425.625 18.4574L423.141 16.0061L407.906 0.974869C407.243 0.342693 406.356 -0.00735523 405.434 0.000116312C404.512 0.00758785 403.63 0.371983 402.978 1.01482C402.326 1.65765 401.956 2.52749 401.947 3.43698C401.939 4.34648 402.293 5.22286 402.933 5.87737L412.167 14.9886L3.51562 14.9886C2.58322 14.9886 1.689 15.3541 1.02969 16.0046C0.370385 16.6551 -7.66585e-07 17.5374 -8.06798e-07 18.4574C-8.47011e-07 19.3773 0.370385 20.2596 1.02969 20.9101C1.689 21.5607 2.58322 21.9261 3.51562 21.9261L412.167 21.9261L402.933 31.0374Z" fill="currentColor"/>
                 </svg>
             </div>
             <p className="text-3xl font-medium leading-tight text-[#244816] tracking-tight">
               Our mission is to make your team efficient and flexible to achieve great results.
             </p>
           </div>
        </div>

        {/* Center Column: Buttons (Top) + Stats Cards (Bottom) */}
        {/* Order: Mobile 1, Desktop 2 */}
        <div className="order-1 md:order-2 col-span-1 md:col-span-6 flex flex-col justify-between">
            
            {/* Top: Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-0">
                <NubButton variant="primary">
                  Get Started
                </NubButton>
      
                <NubButton variant="secondary">
                  View Demo
                </NubButton>
            </div>

            {/* Bottom: Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Stat 1 (White) */}
              <div className="bg-[#F3F4F6] rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center min-h-[220px]">
                 <h3 className="text-5xl font-black mb-2 tracking-tighter">100%</h3>
                 <p className="text-sm text-gray-500 font-medium leading-tight">
                   Profit retention on every ticket sold.
                 </p>
              </div>

              {/* Middle Image (Wavy) */}
              <div className="relative h-[220px] w-full">
                 <svg 
                   viewBox="0 0 950 770" 
                   className="w-full h-full"
                   preserveAspectRatio="none"
                 >
                   <defs>
                      <pattern id="team-image-pattern" patternUnits="userSpaceOnUse" width="950" height="770">
                          <image href="/artifacts/meeting_team.png" x="0" y="0" width="950" height="770" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                   </defs>
                   <path 
                     d="M800 0C882.843 0 950 67.1573 950 150V240C950 302.886 911.3 356.732 856.418 379.026C851.665 380.956 851.665 389.044 856.418 390.974C911.3 413.268 950 467.114 950 530V620C950 702.843 882.843 770 800 770H150C67.1573 770 1.44998e-06 702.843 1.44998e-06 620V530C1.44998e-06 467.114 38.6993 413.268 93.5817 390.974C98.3342 389.044 98.3342 380.956 93.5817 379.026C38.6993 356.732 1.10068e-06 302.886 1.10068e-06 240V150C1.10068e-06 67.1573 67.1573 0 150 0H800Z" 
                     fill="url(#team-image-pattern)"
                   />
                 </svg>
              </div>

              {/* Stat 2 (Green) */}
              <div className="bg-[#D1F366] rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center min-h-[220px]">
                 <h3 className="text-5xl font-black mb-2 tracking-tighter">0%</h3>
                 <p className="text-sm text-black/70 font-medium leading-tight">
                   Monthly fees or hidden costs.
                 </p>
              </div>

            </div>

        </div>

        {/* Right Card: Image (Tall Right) */}
        {/* Order: Mobile 3, Desktop 3 */}
        <div className="order-3 md:order-3 col-span-1 md:col-span-3 relative min-h-[500px] md:min-h-[600px] w-full h-full">
          <svg viewBox="0 0 964 1508" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="professional_working-pattern" patternUnits="userSpaceOnUse" width="964" height="1508">
                <image href="/artifacts/professional_working.png" x="0" y="0" width="964" height="1508" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
            <path d="M717.5 754C853.638 754 964 864.362 964 1000.5V1261.5C964 1397.64 853.638 1508 717.5 1508H260.5C124.362 1508 14 1397.64 14 1261.5V1000.5C14 864.362 124.362 754 260.5 754H246.5C110.362 754 0 643.638 0 507.5V246.5C0 110.362 110.362 0 246.5 0H703.5C839.638 0 950 110.362 950 246.5V507.5C950 643.638 839.638 754 703.5 754H717.5Z" fill="url(#professional_working-pattern)"/>
          </svg>
         </div>

      </div>

      {/* Scattered Icons for Depth */}
      <div className="absolute bottom-20 left-10 text-gray-300 animate-spin-slow">
         <Ticket size={40} />
      </div>
      <div className="absolute top-1/2 right-10 text-gray-300 hidden md:block">
         <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center rotate-12">
            <Mail size={24} />
         </div>
      </div>

    </section>
  );
}
