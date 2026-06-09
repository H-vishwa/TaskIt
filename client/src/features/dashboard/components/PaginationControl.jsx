import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useTaskContext } from "../../../context/TaskContext";

const PaginationControl = () => {
  const { pagination, loading, fetchTasks } = useTaskContext();

  return (
    <Card className="bg-transparent border-none">
      <CardContent className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <Button
          disabled={pagination.page <= 1 || loading}
          type="button"
          onClick={() => fetchTasks(pagination.page - 1)}>
          <ArrowLeft />
          <span className="ml-2 hidden md:inline">Prev</span>
        </Button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          disabled={pagination.page >= pagination.totalPages || loading}
          type="button"
          onClick={() => fetchTasks(pagination.page + 1)}>
          <span className="ml-2 hidden md:inline">Next</span>
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaginationControl;
