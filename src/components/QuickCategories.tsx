import { cn } from "@/lib/utils";
import {
    GraduationCap,
    DollarSign,
    Bus,
    Users,
    Building2,
    MapPin,
    BookOpen,
    Clock
} from "lucide-react";

interface QuickCategoriesProps {
    onCategorySelect: (category: string, question: string) => void;
}

const categories = [
    {
        id: "academics",
        label: "Academics",
        icon: GraduationCap,
        color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
        question: "What courses are offered at LBS College?"
    },
    {
        id: "fees",
        label: "Fees",
        icon: DollarSign,
        color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
        question: "What is the fee structure for B.Tech?"
    },
    {
        id: "bus",
        label: "Bus Routes",
        icon: Bus,
        color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
        question: "What are the college bus routes and timings?"
    },
    {
        id: "faculty",
        label: "Faculty",
        icon: Users,
        color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
        question: "Who are the faculty members in CSE department?"
    },
    {
        id: "clubs",
        label: "Clubs",
        icon: Building2,
        color: "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20",
        question: "What clubs are available in the college?"
    },
    {
        id: "locations",
        label: "Campus",
        icon: MapPin,
        color: "bg-teal-500/10 text-teal-600 hover:bg-teal-500/20",
        question: "Where is the library located?"
    },
    {
        id: "library",
        label: "Library",
        icon: BookOpen,
        color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
        question: "What are the library timings?"
    },
    {
        id: "hostel",
        label: "Hostel",
        icon: Clock,
        color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20",
        question: "What are the hostel facilities and fees?"
    },
];

const QuickCategories = ({ onCategorySelect }: QuickCategoriesProps) => {
    return (
        <div className="w-full">
            <p className="text-xs text-muted-foreground mb-2 text-center">Quick Questions</p>
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onCategorySelect(category.id, category.question)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium",
                                "transition-all duration-200 ease-out",
                                "border border-transparent",
                                "focus:outline-none focus:ring-2 focus:ring-kerala-green/30",
                                category.color
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{category.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickCategories;
