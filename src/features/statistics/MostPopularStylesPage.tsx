// File: pages/MostPopularStylesPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import PaletteIcon from "@mui/icons-material/Palette";
import { mockData } from "../mockData"; // Assuming the mock data is in this file

export const MostPopularStylesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        color="primary"
        onClick={handleBackClick}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Typography variant="h4" gutterBottom>
        Most Popular Styles
      </Typography>

      {/* Pie Chart for Most Popular Styles */}
      <Box sx={{ mb: 4 }}>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={mockData.topStyles}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, percent }) =>
                `${name} ${(percent! * 100).toFixed(0)}%`
              }
            >
              {mockData.topStyles.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} strokeWidth={2} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend formatter={(value) => <span>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Display details of each style */}
      <Grid container spacing={2}>
        {mockData.topStyles.map((style, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ boxShadow: 1 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: style.color, color: "#fff" }}>
                    {style.name.charAt(0)}
                  </Avatar>
                }
                title={style.name}
                subheader={`Usage count: ${style.count}`}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Trend: {style.trend.toFixed(1)}% (this month)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {style.trend >= 0
                    ? `Up by ${style.trend.toFixed(1)}%`
                    : `Down by ${Math.abs(style.trend).toFixed(1)}%`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
