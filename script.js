const { createApp } = Vue;

createApp({
  data() {
    return {
      currentTab: "shows",
      searchBox: "",
      filterBox: "all",
      loading: false,
      errorState: false,
      currentList: [],
      modalOpen: false,
      selectedItem: null,

      // [value, text shown]
      filterOptions: {
        shows: [
          ["all", "All Genres"],
          ["Drama", "Drama"],
          ["Comedy", "Comedy"],
          ["Action", "Action"],
          ["Science-Fiction", "Sci-Fi"],
          ["Thriller", "Thriller"],
          ["Horror", "Horror"]
        ],
        movies: [
          ["all", "All Genres"],
          ["Action & Adventure", "Action & Adventure"],
          ["Comedy", "Comedy"],
          ["Drama", "Drama"],
          ["Horror", "Horror"],
          ["Sci-Fi & Fantasy", "Sci-Fi & Fantasy"],
          ["Thriller", "Thriller"],
          ["Romance", "Romance"]
        ],
        trivia: [
          ["11", "Film"],
          ["14", "Television"],
          ["13", "Musicals & Theatres"],
          ["32", "Cartoon & Animations"],
          ["31", "Anime & Manga"]
        ]
      },

      titles: {
        shows: ["TV Show Explorer", "Powered by TVMaze API"],
        movies: ["Movie Explorer", "Powered by iTunes Search API"],
        trivia: ["Entertainment Trivia", "Powered by Open Trivia Database"]
      }
    };
  },

  methods: {
    // Change tab
    changeTab(tab) {
      this.currentTab = tab;
      this.searchBox = "";
      this.filterBox = this.filterOptions[tab][0][0]; // first option of that tab
      this.loadData();
    },

    // Load data from the API of the current tab
    async loadData() {
      this.loading = true;
      this.errorState = false;
      this.currentList = [];

      try {
        if (this.currentTab === "shows") {
          // API 1: TVMaze
          var query = this.searchBox.trim() !== "" ? this.searchBox : "batman";
          var url = "https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(query);
          var response = await fetch(url);
          if (!response.ok) throw new Error("TVMaze error");
          var data = await response.json();

          // each item is { score, show }, so we take only the show
          var shows = data.map(item => item.show);

          // filter by genre
          if (this.filterBox !== "all") {
            shows = shows.filter(show => show.genres.includes(this.filterBox));
          }
          this.currentList = shows;

        } else if (this.currentTab === "movies") {
          // API 2: iTunes Search API
          var query = this.searchBox.trim() !== "" ? this.searchBox : "marvel";
          var url = "https://itunes.apple.com/search?term=" + encodeURIComponent(query) +
                    "&media=movie&entity=movie&limit=24";
          var response = await fetch(url);
          if (!response.ok) throw new Error("iTunes error");
          var data = await response.json();

          var movies = data.results;

          // filter by genre
          if (this.filterBox !== "all") {
            movies = movies.filter(movie => movie.primaryGenreName === this.filterBox);
          }
          this.currentList = movies;

        } else if (this.currentTab === "trivia") {
          // API 3: Open Trivia Database
          var url = "https://opentdb.com/api.php?amount=10&type=multiple&category=" + this.filterBox;
          var response = await fetch(url);
          if (!response.ok) throw new Error("Trivia error");
          var data = await response.json();

          // response_code 0 = success (5 = too many requests, wait 5 seconds)
          if (data.response_code !== 0) throw new Error("Trivia code " + data.response_code);

          // add show: false so the answer is hidden at first
          this.currentList = data.results.map(item => {
            item.show = false;
            return item;
          });
        }

      } catch (error) {
        console.error(error);
        this.errorState = true;
      } finally {
        this.loading = false;
      }
    },

    // make the iTunes poster bigger (the API gives a small 100x100 one)
    bigImage(url) {
      return url.replace("100x100bb", "400x400bb");
    },

    // Open the details popup
    showDetails(item) {
      this.selectedItem = item;
      this.modalOpen = true;
    },

    // Close the details popup
    closeModal() {
      this.modalOpen = false;
      this.selectedItem = null;
    }
  },

  // Runs when the page first opens
  mounted() {
    this.loadData();
  }
}).mount("#app");