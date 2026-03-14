import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataTableProps {
  title: string;
  description: string;
}

export function DataTable({ title, description }: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
