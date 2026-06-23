export const movieArtworkByTitle: Record<string, { bannerUrl: string; posterUrl: string; rating: string }> = {
  "Meg 2: The Trench": {
    bannerUrl: "/homepage/b9ca521403d1c9bc1d0fe28b9ef77c019eeeb4e6.png",
    posterUrl: "/homepage/c5b170ba76ed51a19d6efe07a6af64a38c291e62.jpg",
    rating: "4.5",
  },
  "The Nun II": {
    bannerUrl: "/homepage/nun_ii.jpg",
    posterUrl: "/homepage/nun_ii.jpg",
    rating: "4.5",
  },
  "Fast X": {
    bannerUrl: "/homepage/a2c39e9e54c5f767f395fb9ad735523f7d1e9aed.jpg",
    posterUrl: "/homepage/a2c39e9e54c5f767f395fb9ad735523f7d1e9aed.jpg",
    rating: "4.5",
  },
  "John Wick: Chapter 4": {
    bannerUrl: "/homepage/75ed6e1047cdc6d5762360af83e22439d5e2bcfd.jpg",
    posterUrl: "/homepage/75ed6e1047cdc6d5762360af83e22439d5e2bcfd.jpg",
    rating: "4.5",
  },
};

export const applyMovieArtwork = <T extends { title: string; bannerUrl: string; posterUrl: string; rating?: string }>(
  movie: T,
): T => {
  const artwork = movieArtworkByTitle[movie.title];
  if (!artwork) return movie;

  return {
    ...movie,
    bannerUrl: artwork.bannerUrl,
    posterUrl: artwork.posterUrl,
    rating: artwork.rating,
  };
};
