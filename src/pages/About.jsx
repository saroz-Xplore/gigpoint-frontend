import React from "react";
import {
  FaReact,
  FaNodeJs,
  FaLock,
  FaKey,
  FaJsSquare,
  FaCode,
  FaEnvelope,
  FaDatabase,
  FaUserShield,
  FaCloud,
  FaFileUpload,
  FaLeaf,
  FaGitAlt,
  FaGithub,
  FaGoogle, 
} from "react-icons/fa";
import { SiTailwindcss } from "react-icons/si";
import Slideshow from "../components/Slideshow";


const AboutPage = () => {
  return (
    <div className="bg-white font-sans">
      {/* About GigPoint Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12">
          {/* Text Side */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-extrabold text-blue-600 tracking-wide font-serif mb-2">
              About GigPoint
            </h1>
            <p className="text-lg leading-relaxed text-gray-700">
              GigPoint is a platform built to solve real problems people face at
              home whether it’s a leaking pipe, electrical issue, cleaning
              needs, or general repairs.
              <br />
              <br />
              We make it easy for anyone to post a job when they need help with
              something at home. Once a job is posted, skilled workers who match
              the job can apply. The person who posted the job gets to choose
              the right worker based on their skills and experience.
              <br />
              <br />
              Our goal is to connect people who need help with trusted local
              workers in a simple and fast way. No more calling around or
              waiting for someone to show up. Just post your job and get it
              done.
              <br />
              <br />
              At GigPoint, we believe in giving equal opportunities to workers
              and making life easier for everyone at home.
            </p>
          </div>

          {/* Image Side */}
          <div className="md:w-1/2">
            <Slideshow />
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">
            Our Technology Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
            <TechItem Icon={FaReact} label="React.js" color="text-blue-500" />
            <TechItem
              Icon={SiTailwindcss}
              label="Tailwind CSS"
              color="text-cyan-400"
            />
            <TechItem Icon={FaNodeJs} label="Node.js" color="text-green-600" />
            <TechItem Icon={FaLock} label="JWT" color="text-purple-600" />
            <TechItem Icon={FaKey} label="Bcrypt" color="text-blue-600" />
            <TechItem
              Icon={FaJsSquare}
              label="JavaScript"
              color="text-yellow-400"
            />
            <TechItem Icon={FaCode} label="TypeScript" color="text-blue-700" />
            <TechItem
              Icon={FaEnvelope}
              label="Nodemailer"
              color="text-red-500"
            />
            <TechItem Icon={FaDatabase} label="Redis" color="text-red-600" />
            <TechItem
              Icon={FaUserShield}
              label="Passport.js"
              color="text-blue-800"
            />
            <TechItem Icon={FaCloud} label="Cloudinary" color="text-blue-400" />
            <TechItem
              Icon={FaFileUpload}
              label="Multer"
              color="text-indigo-600"
            />
            <TechItem
              Icon={FaGoogle}
              label="Google 2.5 Flash LLM"
              color="text-green-600"
            />{" "}
            {/* ✅ fixed */}
            <TechItem Icon={FaLeaf} label="MongoDB" color="text-green-700" />
            <TechItem Icon={FaGitAlt} label="Git" color="text-orange-500" />
            <TechItem Icon={FaGithub} label="GitHub" color="text-gray-800" />
          </div>
        </div>
      </div>

      {/* Meet Our Developers Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-800 mb-4">
            Meet Our Developers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Behind GigPoint are passionate developers who crafted both frontend
            and backend with dedication.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <DeveloperCard
            name="Saroj Simkhada"
            role="Frontend Developer"
            github="https://github.com/saroz-Xplore"
            imgSrc="saroj.jpg"
            description="Handled UI/UX using React and Tailwind CSS for smooth and responsive design."
            lightTheme
          />

          <DeveloperCard
            name="Ayush Pandey"
            role="Backend Developer"
            github="https://github.com/ayusclg"
            imgSrc="ayush.jpg"
            description="Built secure and efficient backend APIs using Node.js, Express, and MongoDB."
            lightTheme
          />
        </div>
      </div>
    </div>
  );
};

const TechItem = ({ Icon, label, color }) => (
  <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
    <Icon className={`text-5xl mx-auto mb-3 ${color}`} />
    <p className="font-medium text-gray-800">{label}</p>
  </div>
);

const DeveloperCard = ({ name, role, github, imgSrc, description, lightTheme }) => {
  const bgColor = lightTheme ? "bg-blue-100" : "bg-blue-600";
  const nameColor = lightTheme ? "text-blue-700" : "text-blue-800";
  const roleColor = lightTheme ? "text-blue-500" : "text-blue-600";
  const githubColor = lightTheme ? "text-blue-500" : "text-blue-600";

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition text-center">
      <div className={`${bgColor} flex items-center justify-center h-48`}>
        <img
          src={imgSrc}
          alt={name}
          className="rounded-full w-32 h-32 object-cover border-4 border-white "

        />
      </div>
      <div className="p-6 pt-16">
        <h3 className={`text-xl font-bold mb-1 ${nameColor}`}>{name}</h3>
        <p className={`mb-4 ${roleColor}`}>{role}</p>
        <p className="text-gray-600 mb-4">{description}</p>
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-medium hover:underline ${githubColor}`}
        >
          GitHub Profile
        </a>
      </div>
    </div>
  );
};

export default AboutPage;
