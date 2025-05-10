import React from "react";
import { Box, Card, CardActionArea, Grid, Typography } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import CommentIcon from "@mui/icons-material/Comment";
import ReportIcon from "@mui/icons-material/Report";
import CategoryIcon from "@mui/icons-material/Category";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate } from "react-router-dom";

interface Tile {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
}

const tiles: Tile[] = [
  {
    title: "Quản lý người dùng",
    description: "Thêm / xoá / khoá tài khoản",
    icon: <GroupIcon fontSize="large" color="primary" />,
    path: "/users",
  },
  {
    title: "Quản lý bài viết",
    description: "Duyệt & xoá bài đăng",
    icon: <ArticleIcon fontSize="large" color="primary" />,
    path: "/posts",
  },
  {
    title: "Quản lý bình luận",
    description: "Xem / xoá bình luận",
    icon: <CommentIcon fontSize="large" color="primary" />,
    path: "/comments",
  },
  {
    title: "Quản lý report",
    description: "Kiểm tra báo cáo vi phạm",
    icon: <ReportIcon fontSize="large" color="primary" />,
    path: "/reports",
  },
  {
    title: "Quản lý category",
    description: "Thêm / sửa danh mục",
    icon: <CategoryIcon fontSize="large" color="primary" />,
    path: "/categories",
  },
  {
    title: "Thống kê",
    description: "Xem số liệu hệ thống",
    icon: <BarChartIcon fontSize="large" color="primary" />,
    path: "/statistics",
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3} color="primary.main" fontWeight={600}>
        Admin Dashboard
      </Typography>

      {/* Grid container */}
      <Grid container spacing={3}>
        {tiles.map(({ title, description, icon, path }) => (
          /* each Grid is an item by default; use `size` for breakpoints */
          <Grid key={title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={3}>
              <CardActionArea
                sx={{ p: 2, height: "100%" }}
                onClick={() => navigate(path)}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  textAlign="center"
                >
                  {icon}
                  <Typography variant="h6" mt={1} mb={0.5}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
