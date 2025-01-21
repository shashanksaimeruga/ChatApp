import { Carousel } from "../ui/carousel";
import { User } from "lucide-react";
import { motion } from 'framer-motion';

const testimonials = [
  { name: "John Doe", feedback: "ChatApp has revolutionized how I communicate with my team. It's intuitive, fast, and secure!", role: "Software Engineer", avatar: "/path/to/john-avatar.jpg" },
  { name: "Jane Smith", feedback: "The features are fantastic, and the user experience is unparalleled. ChatApp is a game-changer!", role: "Product Manager", avatar: "/path/to/jane-avatar.jpg" },
  { name: "Sam Wilson", feedback: "As a designer, I appreciate the sleek interface and smooth animations. ChatApp is a joy to use!", role: "UX Designer", avatar: "/path/to/sam-avatar.jpg" },
];

const Testimonials = () => {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 font-brenet-extrude">
            Testimonials
          </h2>
          <Carousel className="max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <User className="w-12 h-12 rounded-full bg-primary text-primary-foreground p-2 mr-4" />
                  <div>
                    <h3 className="font-bold text-lg font-brenet-shadow">
                      {testimonial.name}
                    </h3>
                    <p className="text-muted-foreground font-brenet-regular">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-foreground mb-4 font-brenet-regular">
                  "{testimonial.feedback}"
                </p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;