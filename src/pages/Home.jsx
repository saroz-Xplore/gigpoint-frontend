import React from "react";
import {
  FaTools,
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
      <Icon className="text-6xl text-primary-600" />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
    </div>
  </div>
);

const HowItWorksStep = ({ Icon, step, title, description }) => (
  <div className="how-it-works-step bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center transition-colors duration-300 hover:bg-primary-600 hover:text-black cursor-pointer">
    <div className="step-icon bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 text-blue-600 hover:text-blue">
      <Icon className="text-2xl" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{step}. {title}</h3>
    <p>{description}</p>
  </div>
);



const HomePage = () => {
  return (
    <div className="font-sans text-black bg-white">
      {/* Navigation */}
      <nav className="bg-primary-500 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaTools className="text-2xl" />
            <span className="text-xl font-bold">GigPoint</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-primary-200">Home</a>
            <a href="#" className="hover:text-primary-200">Services</a>
            <a href="#" className="hover:text-primary-200">How It Works</a>
            <a href="#" className="hover:text-primary-200">About Us</a>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="px-4 py-2 rounded-md bg-white text-primary-600 font-medium hover:bg-primary-100">Login</a>
            <a href="#" className="px-4 py-2 rounded-md bg-primary-700 text-white font-medium hover:bg-primary-800">Sign Up</a>
            <button className="md:hidden">
              <FaTools className="text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
                href="#"
                className="px-6 py-3 bg-primary-600 text-black rounded-md font-medium hover:bg-primary-700 text-center"
              >
                Post a Job
              </a>
              <a
                href="#"
                className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-md font-medium hover:bg-primary-50 text-center"
              >
                Browse Services
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://plus.unsplash.com/premium_photo-1678766819262-cdc490bfd0d1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG5lcGFsaSUyMGVsZWN0cmljaWFuJTIwd29ya2luZ3xlbnwwfHwwfHx8MA%3D%3D"
              alt="Home service professional"
              className="rounded-lg shadow-xl max-w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
     <section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      <div className="service-card bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="h-48 bg-primary-100 flex items-center justify-center">
          <FaFaucet className="text-6xl text-blue-600" />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Plumbing</h3>
          <p className="text-gray-600 mb-4">Fix leaks, install fixtures, and solve all your plumbing issues with certified professionals.</p>
        </div>
      </div>

      <div className="service-card bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="h-48 bg-primary-100 flex items-center justify-center">
          <FaBolt className="text-6xl text-blue-600" />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Electrical</h3>
          <p className="text-gray-600 mb-4">Wiring, installations, repairs - our electricians handle all your electrical needs safely.</p>
        </div>
      </div>

      <div className="service-card bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="h-48 bg-primary-100 flex items-center justify-center">
          <FaHammer className="text-6xl text-blue-600" />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Carpentry</h3>
          <p className="text-gray-600 mb-4">Custom furniture, repairs, installations - skilled carpenters for all woodwork needs.</p>
        </div>
      </div>

      <div className="service-card bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="h-48 bg-primary-100 flex items-center justify-center">
          <FaBroom className="text-6xl text-blue-600" />
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Cleaning</h3>
          <p className="text-gray-600 mb-4">Deep cleaning, regular maintenance, move-in/move-out services by professional cleaners.</p>
        </div>
      </div>

    </div>
  </div>
</section>


      {/* How It Works Section */}
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

     

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Solve Your Home Problems?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found the perfect professionals for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a href="#" className="px-8 py-3 bg-white text-primary-600 rounded-md font-bold hover:bg-gray-100 ml-44">
              Post a Job - It's Free
            </a>
            <a href="#" className="px-8 py-3 border border-white text-white rounded-md font-bold hover:bg-primary-700">
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
