import React from "react";
import { Card, CardContent, Typography, SxProps, Theme } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  description?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  className,
  sx,
}) => (
  <Card className={`h-full border-dashed border ${className || ""}`} sx={sx}>
    <CardContent>
      <Typography
        variant="h6"
        component="div"
        gutterBottom
        className="font-semibold text-gray-700"
      >
        {title}
      </Typography>
      <Typography
        variant="h4"
        component="p"
        className="text-[#03799e] font-bold"
      >
        {value ?? "N/A"}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {description}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
