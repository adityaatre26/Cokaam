import { Card } from "@/components/ui/card";

const StatCard = ({
  statValue,
  statLabel,
}: {
  statValue: number;
  statLabel: string;
}) => {
  return (
    <Card
      key={statLabel}
      className="bg-[#0c0c0c] border-gray-500 border border-dashed p-6 min-h-[120px] flex flex-col justify-between rounded-sm transition-all duration-500 ease-in-out hover:border-gray-400 hover:shadow-lg group"
    >
      <div className="text-4xl font-primary text-white group-hover:text-[2.5rem] transition-all duration-150 ease-out">
        {statValue}
      </div>
      <div className="text-gray-300 font-darker text-lg mb-1 capitalize group-hover:text-sm transition-all duration-150 ease-out">
        {statLabel}
      </div>
    </Card>
  );
};
export default StatCard;
