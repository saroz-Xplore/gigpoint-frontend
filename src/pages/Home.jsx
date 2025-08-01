import React from "react";
import {
  FaFaucet,
  FaBolt,
  FaHammer,
  FaBroom,
  FaEdit,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

const ServiceCard = ({ Icon, title, description }) => (
  <div className="service-card bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="h-48 bg-primary-100 flex items-center justify-center">
      <Icon className="text-6xl text-blue-600" />  
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
    </div>
  </div>
);


const HowItWorksStep = ({ Icon, step, title, description }) => (
  <div className="how-it-works-step bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="step-icon bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="text-2xl text-blue-600" />  
    </div>
    <h3 className="text-xl font-semibold mb-2">{step}. {title}</h3>
    <p>{description}</p>
  </div>
);


const HomePage = () => {
  return (
    <div className="font-sans text-black bg-white">

      
      <section
        className="hero-section py-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Trusted Professionals for Your Home Needs
            </h1>
            <p className="text-lg mb-6">
              Post your home service needs and connect with qualified
              professionals ready to help with plumbing, electrical work,
              carpentry, cleaning, and more.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                href="/login"
                className="px-6 py-3 bg-primary-600 text-black border rounded-md font-medium hover:bg-blue-500 text-center"
              >
                Post a Job
              </a>
              <a
                href="/about"
                className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-md font-medium hover:bg-blue-500 text-center"
              >
                Browse Services
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="homepage.jpg"
              alt="Home service professional"
              className="rounded-lg max-w-full h-auto border border-gray-200"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <ServiceCard
              Icon={FaFaucet}
              title="Plumbing"
              description="Fix leaks, install fixtures, and solve all your plumbing issues with certified professionals."
            />
            <ServiceCard
              Icon={FaBolt}
              title="Electrical"
              description="Wiring, installations, repairs - our electricians handle all your electrical needs safely."
            />
            <ServiceCard
              Icon={FaHammer}
              title="Carpentry"
              description="Custom furniture, repairs, installations - skilled carpenters for all woodwork needs."
            />
            <ServiceCard
              Icon={FaBroom}
              title="Cleaning"
              description="Deep cleaning, regular maintenance, move-in/move-out services by professional cleaners."
            />

          </div>
        </div>
      </section>

    
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How GigPoint Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <HowItWorksStep
              Icon={FaEdit}
              step="1"
              title="Post Your Job"
              description="Describe your home service need in detail and set your budget."
            />
            <HowItWorksStep
              Icon={FaUsers}
              step="2"
              title="Get Quotes"
              description="Qualified professionals will send you quotes for your job."
            />
            <HowItWorksStep
              Icon={FaCheckCircle}
              step="3"
              title="Hire & Get Work Done"
              description="Choose the best professional and get your job done to your satisfaction."
            />

          </div>
        </div>
      </section>

      
      <section className="py-16 bg-primary-600 text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Solve Your Home Problems?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover trusted experts ready to handle all your home service needs with care and professionalism.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a href="/login" className="px-8 py-3 bg-white text-primary-600 rounded-md font-bold hover:bg-blue-300">
              Post a Job - It's Free
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
