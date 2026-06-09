import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

const newColleges = [
  {
    name: "Veermata Jijabai Technological Institute",
    location: "Mumbai, Maharashtra",
    fees: 80000,
    rating: 4.2,
    overview: "VJTI is a premier government engineering institute in Mumbai, known for its strong academic programs, experienced faculty, and excellent placement record. Established in 1887, it has a rich heritage of producing top engineers.",
    courses: "B.Tech in Computer Science, Electrical Engineering, Mechanical Engineering, Civil Engineering, Electronics, Information Technology, Textile, Production",
    placements: "Highest Package: ₹45 LPA, Average Package: ₹12 LPA, Top Recruiters: Google, Microsoft, Amazon, Tata, L&T",
    established: 1887,
    type: "Public",
    website: "https://www.vjti.ac.in",
  },
  {
    name: "Institute of Chemical Technology Mumbai",
    location: "Mumbai, Maharashtra",
    fees: 85000,
    rating: 4.5,
    overview: "ICT Mumbai is a premier government deemed university specializing in chemical engineering and technology. It is renowned for its cutting-edge research, excellent faculty, and strong industry connections.",
    courses: "B.Tech in Chemical Engineering, Chemical Technology, Dyestuff Technology, Food Technology, Oil Technology, Pharmacy, Polymer Engineering",
    placements: "Highest Package: ₹60 LPA, Average Package: ₹15 LPA, Top Recruiters: Reliance, Dr. Reddy's, ITC, Unilever, P&G",
    established: 1933,
    type: "Public",
    website: "https://www.ictmumbai.edu.in",
  },
  {
    name: "Dwarkadas J. Sanghvi College of Engineering",
    location: "Mumbai, Maharashtra",
    fees: 200000,
    rating: 3.9,
    overview: "DJ Sanghvi is a well-regarded private engineering college in Mumbai affiliated with Mumbai University. It offers quality education with modern infrastructure and good placement opportunities.",
    courses: "B.E. in Computer Science, Electronics, Electrical, Mechanical, Civil, Information Technology, Biotechnology",
    placements: "Highest Package: ₹35 LPA, Average Package: ₹8 LPA, Top Recruiters: TCS, Capgemini, JP Morgan, Deloitte, Accenture",
    established: 1994,
    type: "Private",
    website: "https://www.djsanghvi.ac.in",
  },
  {
    name: "Pune Institute of Computer Technology",
    location: "Pune, Maharashtra",
    fees: 150000,
    rating: 4.0,
    overview: "PICT is a leading private engineering college in Pune known for its strong computer science and IT programs. It has excellent placement records and a vibrant campus culture.",
    courses: "B.E. in Computer Science, Information Technology, Electronics, Electronics & Telecommunications",
    placements: "Highest Package: ₹50 LPA, Average Package: ₹10 LPA, Top Recruiters: Microsoft, Amazon, Goldman Sachs, Google, TCS",
    established: 1983,
    type: "Private",
    website: "https://www.pict.edu",
  },
  {
    name: "KJ Somaiya College of Engineering",
    location: "Mumbai, Maharashtra",
    fees: 250000,
    rating: 3.8,
    overview: "KJSCE is a respected private engineering college in Mumbai under Somaiya Vidyavihar University. It offers quality engineering education with strong industry linkages and good placements.",
    courses: "B.Tech in Computer Science, Electronics, Electrical, Mechanical, Civil, Information Technology, Artificial Intelligence & Data Science",
    placements: "Highest Package: ₹30 LPA, Average Package: ₹8 LPA, Top Recruiters: Capgemini, Accenture, Wipro, TCS, L&T",
    established: 1983,
    type: "Private",
    website: "https://kjsce.somaiya.edu",
  },
  {
    name: "MIT World Peace University",
    location: "Pune, Maharashtra",
    fees: 350000,
    rating: 3.7,
    overview: "MIT WPU is a private university in Pune known for its holistic education approach combining technical excellence with value-based learning. It offers modern infrastructure and decent placement opportunities.",
    courses: "B.Tech in Computer Science, Electronics, Mechanical, Civil, Electrical, Chemical, Biotechnology, Data Science",
    placements: "Highest Package: ₹25 LPA, Average Package: ₹7 LPA, Top Recruiters: Cognizant, Tech Mahindra, Infosys, TCS, Wipro",
    established: 1983,
    type: "Private",
    website: "https://www.mitwpu.edu.in",
  },
];

async function main() {
  for (const c of newColleges) {
    const existing = await prisma.college.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.college.create({ data: c });
      console.log(`Added: ${c.name}`);
    } else {
      console.log(`Exists: ${c.name}`);
    }
  }
  console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
