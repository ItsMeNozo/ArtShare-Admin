import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  Typography,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopAIPost {
  id: string;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  likeCount?: number;
  like_count?: number; // Alternative field name for compatibility
}

interface TopAIPostsProps {
  posts: TopAIPost[];
  filter: 'all' | 'last7';
  showSeeAllButton?: boolean;
  onPostClick?: (post: TopAIPost) => void;
}

export const TopAIPosts: React.FC<TopAIPostsProps> = ({
  posts,
  filter,
  showSeeAllButton = false,
  onPostClick,
}) => {
  const navigate = useNavigate();

  const handlePostClick = (post: TopAIPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      navigate('/posts', {
        state: {
          postId: post.id,
        },
      });
    }
  };

  const handleSeeAllClick = () => {
    navigate('/posts?ai_created=true');
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title={
          <Typography variant="subtitle1">
            Top 5 AI Posts ({filter === 'last7' ? '7 Days' : 'All-time'})
          </Typography>
        }
      />
      <CardContent>
        {posts.length ? (
          <ImageList
            cols={3}
            gap={20}
            sx={{
              m: 0,
              '& .MuiImageListItem-root': {
                height: '200px !important', // Fixed height for all items
                aspectRatio: '1', // Square aspect ratio
              },
            }}
          >
            {posts.map((post) => (
              <ImageListItem
                key={post.id}
                sx={{
                  cursor: 'pointer',
                  height: '200px', // Fixed height
                  width: '100%', // Full width of grid column
                }}
                onClick={() => handlePostClick(post)}
              >
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <ImageListItemBar
                  title={
                    <Tooltip title={post.title} arrow placement="top">
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#fff',
                          fontSize: '0.8rem',
                          lineHeight: 1.2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2, // Limit to 2 lines
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '150px', // Constrain width for better truncation
                        }}
                      >
                        {post.title}
                      </Typography>
                    </Tooltip>
                  }
                  subtitle={
                    <Typography
                      variant="caption"
                      sx={{ color: '#fff', opacity: 0.85, fontSize: '0.7rem' }}
                    >
                      {format(parseISO(post.createdAt), 'MMM d')}
                    </Typography>
                  }
                  actionIcon={
                    <Box sx={{ mr: 1, pr: 2 }}>
                      <Badge
                        badgeContent={post.likeCount || post.like_count}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: '#ff1744',
                            color: '#fff',
                            border: '1.5px solid #fff',
                            fontSize: '0.65rem',
                          },
                        }}
                      >
                        <ThumbUpIcon
                          sx={{
                            color: '#fff',
                            fontSize: '1rem',
                            mt: '6px',
                          }}
                        />
                      </Badge>
                    </Box>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No posts found for the selected time period.
            </Typography>
          </Box>
        )}

        {showSeeAllButton && (
          <Box mt={2} textAlign="right">
            <Button onClick={handleSeeAllClick}>See all</Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
