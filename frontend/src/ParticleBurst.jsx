import { motion } from "framer-motion";

export default function ParticleBurst({ color = "gold" }) {
  const particles = Array.from({ length: 12 }); // number of particles

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 999,
      }}
    >
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
          animate={{
            scale: [1, 0],
            opacity: [1, 0],
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}`,
          }}
        />
      ))}
    </div>
  );
}