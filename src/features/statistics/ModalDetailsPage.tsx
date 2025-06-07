// File: pages/ModelDetailsPage.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
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
import BubbleChartIcon from "@mui/icons-material/BubbleChart";

interface ModelUsageData {
  name: string;
  value: number;
  color: string;
}

interface MockDataType {
  imageGenerationByModel: ModelUsageData[];
}

// ---- MOCK DATA ----
const mockData: MockDataType = {
  imageGenerationByModel: [
    { name: "Stable Diffusion 3", value: 45, color: "#0088FE" },
    { name: "DALL-E 3", value: 30, color: "#00C49F" },
    { name: "Midjourney v6", value: 15, color: "#FFBB28" },
    { name: "Imagen 2", value: 10, color: "#FF8042" },
  ],
};

export const ModelDetailsPage: React.FC = () => {
  const navigate = useNavigate(); // Use useNavigate hook to navigate
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("q") || "";
  const [keyword, setKeyword] = React.useState<string>(initialKeyword);

  // When the "Search" button is clicked, update the query param and re-render
  const applySearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }
    setSearchParams(params);
  };

  // Get the original data array
  const allModels: ModelUsageData[] = mockData.imageGenerationByModel;

  // Filter by keyword: only keep models whose names contain the substring (case-insensitive)
  const filteredModels = keyword
    ? allModels.filter((m) =>
        m.name.toLowerCase().includes(keyword.toLowerCase()),
      )
    : allModels;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)} // Navigate back to the previous page
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Typography variant="h4" gutterBottom>
        Details: All AI Models
      </Typography>

      {/* Search Filter */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          label="Search by model name"
          variant="outlined"
          size="small"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button variant="contained" onClick={applySearch}>
          Search
        </Button>
      </Box>

      {/* If no results */}
      {filteredModels.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No models found matching the keyword “{keyword}”.
        </Typography>
      ) : (
        <Card sx={{ boxShadow: 3 }}>
          <CardHeader
            title="AI Model Distribution Chart"
            avatar={
              <Avatar sx={{ bgcolor: "primary.light" }}>
                <BubbleChartIcon />
              </Avatar>
            }
            titleTypographyProps={{ variant: "h6", fontWeight: "medium" }}
          />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredModels}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name} ${(percent! * 100).toFixed(0)}%`
                  }
                >
                  {filteredModels.map((entry, idx) => (
                    <Cell
                      key={`slice-${idx}`}
                      fill={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    borderRadius: "8px",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  formatter={(value) => <span>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Optionally list details in smaller cards */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          {filteredModels.map((m, idx) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={idx}>
              <Card sx={{ boxShadow: 1 }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: m.color, color: "#fff" }}>
                      {m.name.charAt(0)}
                    </Avatar>
                  }
                  title={m.name}
                  subheader={`Usage: ${m.value}`}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Value: {m.value} (represents{" "}
                    {(
                      (m.value /
                        filteredModels.reduce((sum, e) => sum + e.value, 0)) *
                      100
                    ).toFixed(1)}
                    % of the total)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};
