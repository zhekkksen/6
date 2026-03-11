import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';

// Простое хранилище данных в памяти (временное решение для Snack)
let moviesDB = [];
let genresDB = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror'];
let nextMovieId = 1;
let nextGenreId = 5;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [genreName, setGenreName] = useState('');
  
  // Форма для фильма
  const [movieForm, setMovieForm] = useState({
    id: null,
    title: '',
    description: '',
    release_date: '',
    duration: '',
    director: '',
    rating: '',
    genre: '',
  });

  // Загрузка данных при старте
  useEffect(() => {
    loadMovies();
    loadGenres();
  }, []);

  // Загрузка фильмов с учетом фильтров
  const loadMovies = () => {
    let filtered = [...moviesDB];
    
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGenre) {
      filtered = filtered.filter(m => m.genre === selectedGenre);
    }
    
    setMovies(filtered);
  };

  // Загрузка жанров
  const loadGenres = () => {
    setGenres(genresDB.map((name, index) => ({ id: index + 1, name })));
  };

  // Сохранение фильма
  const saveMovie = () => {
    if (!movieForm.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (movieForm.id) {
      // Обновление существующего фильма
      const index = moviesDB.findIndex(m => m.id === movieForm.id);
      if (index !== -1) {
        moviesDB[index] = { ...movieForm, id: movieForm.id };
        Alert.alert('Success', 'Movie updated');
      }
    } else {
      // Добавление нового фильма
      const newMovie = {
        ...movieForm,
        id: nextMovieId++,
        created_at: new Date().toISOString(),
      };
      moviesDB.push(newMovie);
      Alert.alert('Success', 'Movie added');
    }

    setShowMovieModal(false);
    resetMovieForm();
    loadMovies();
  };

  // Удаление фильма
  const deleteMovie = (id) => {
    Alert.alert(
      'Delete Movie',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            moviesDB = moviesDB.filter(m => m.id !== id);
            if (selectedMovie?.id === id) {
              setSelectedMovie(null);
              setCurrentScreen('main');
            }
            loadMovies();
          }
        }
      ]
    );
  };

  // Сохранение жанра
  const saveGenre = () => {
    if (!genreName.trim()) return;

    if (editingGenre) {
      // Обновление жанра
      genresDB[editingGenre.id - 1] = genreName;
      Alert.alert('Success', 'Genre updated');
    } else {
      // Добавление жанра
      genresDB.push(genreName);
      nextGenreId++;
      Alert.alert('Success', 'Genre added');
    }

    setShowGenreModal(false);
    resetGenreForm();
    loadGenres();
  };

  // Удаление жанра
  const deleteGenre = (index) => {
    Alert.alert(
      'Delete Genre',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            genresDB.splice(index, 1);
            loadGenres();
          }
        }
      ]
    );
  };

  // Сброс формы фильма
  const resetMovieForm = () => {
    setMovieForm({
      id: null,
      title: '',
      description: '',
      release_date: '',
      duration: '',
      director: '',
      rating: '',
      genre: '',
    });
  };

  // Сброс формы жанра
  const resetGenreForm = () => {
    setEditingGenre(null);
    setGenreName('');
  };

  // Очистка фильтров
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre(null);
    setTimeout(loadMovies, 100);
  };

  // Главный экран
  if (currentScreen === 'main') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎬 Movie Collection</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setCurrentScreen('genres')}
            >
              <Text style={styles.headerButtonText}>Genres</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Поиск и фильтры */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search movies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadMovies}
          />
          
          <ScrollView horizontal style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedGenre && styles.filterChipActive]}
              onPress={clearFilters}
            >
              <Text>All</Text>
            </TouchableOpacity>
            
            {genres.map(genre => (
              <TouchableOpacity
                key={genre.id}
                style={[styles.filterChip, selectedGenre === genre.name && styles.filterChipActive]}
                onPress={() => {
                  setSelectedGenre(genre.name);
                  setTimeout(loadMovies, 100);
                }}
              >
                <Text>{genre.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Список фильмов */}
        <FlatList
          data={movies}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedMovie(item);
                setCurrentScreen('detail');
              }}
            >
              <View style={styles.movieCard}>
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle}>{item.title}</Text>
                  <Text style={styles.movieGenre}>{item.genre || 'No genre'}</Text>
                  <View style={styles.movieMeta}>
                    {item.rating && <Text style={styles.movieRating}>⭐ {item.rating}</Text>}
                    {item.director && <Text style={styles.movieDirector}>🎬 {item.director}</Text>}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text>No movies found</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  resetMovieForm();
                  setShowMovieModal(true);
                }}
              >
                <Text style={styles.addButtonText}>+ Add Your First Movie</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Кнопка добавления */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            resetMovieForm();
            setShowMovieModal(true);
          }}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* Модальное окно для фильма */}
        <Modal
          visible={showMovieModal}
          animationType="slide"
          transparent={false}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {movieForm.id ? '✏️ Edit Movie' : '➕ New Movie'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowMovieModal(false);
                  resetMovieForm();
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={movieForm.title}
                  onChangeText={text => setMovieForm({ ...movieForm, title: text })}
                  placeholder="Enter movie title"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={movieForm.description}
                  onChangeText={text => setMovieForm({ ...movieForm, description: text })}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Release Date</Text>
                <TextInput
                  style={styles.input}
                  value={movieForm.release_date}
                  onChangeText={text => setMovieForm({ ...movieForm, release_date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Duration (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={movieForm.duration}
                    onChangeText={text => setMovieForm({ ...movieForm, duration: text })}
                    placeholder="Minutes"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Rating (0-10)</Text>
                  <TextInput
                    style={styles.input}
                    value={movieForm.rating}
                    onChangeText={text => setMovieForm({ ...movieForm, rating: text })}
                    placeholder="0-10"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Director</Text>
                <TextInput
                  style={styles.input}
                  value={movieForm.director}
                  onChangeText={text => setMovieForm({ ...movieForm, director: text })}
                  placeholder="Director name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Genre</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {genres.map(genre => (
                    <TouchableOpacity
                      key={genre.id}
                      style={[
                        styles.genreOption,
                        movieForm.genre === genre.name && styles.genreOptionActive
                      ]}
                      onPress={() => setMovieForm({ ...movieForm, genre: genre.name })}
                    >
                      <Text style={movieForm.genre === genre.name && styles.genreOptionTextActive}>
                        {genre.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveMovie}
              >
                <Text style={styles.saveButtonText}>
                  {movieForm.id ? 'Update Movie' : 'Create Movie'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  // Экран деталей фильма
  if (currentScreen === 'detail' && selectedMovie) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedMovie(null);
              setCurrentScreen('main');
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Movie Details</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setMovieForm({
                  id: selectedMovie.id,
                  title: selectedMovie.title,
                  description: selectedMovie.description || '',
                  release_date: selectedMovie.release_date || '',
                  duration: selectedMovie.duration || '',
                  director: selectedMovie.director || '',
                  rating: selectedMovie.rating || '',
                  genre: selectedMovie.genre || '',
                });
                setShowMovieModal(true);
              }}
            >
              <Text style={styles.headerButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={() => deleteMovie(selectedMovie.id)}
            >
              <Text style={styles.headerButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.detailContainer}>
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{selectedMovie.title}</Text>
            
            {selectedMovie.genre && (
              <View style={styles.detailGenreBadge}>
                <Text style={styles.detailGenre}>{selectedMovie.genre}</Text>
              </View>
            )}

            <View style={styles.detailCard}>
              {selectedMovie.description ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📝 Description</Text>
                  <Text style={styles.detailText}>{selectedMovie.description}</Text>
                </View>
              ) : null}

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>ℹ️ Details</Text>
                
                {selectedMovie.release_date ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Release Date:</Text>
                    <Text>{selectedMovie.release_date}</Text>
                  </View>
                ) : null}

                {selectedMovie.duration ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>⏱️ Duration:</Text>
                    <Text>{selectedMovie.duration} min</Text>
                  </View>
                ) : null}

                {selectedMovie.director ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🎬 Director:</Text>
                    <Text>{selectedMovie.director}</Text>
                  </View>
                ) : null}

                {selectedMovie.rating ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>⭐ Rating:</Text>
                    <Text>{selectedMovie.rating}/10</Text>
                  </View>
                ) : null}
              </View>

              {selectedMovie.created_at && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>🕒 Additional Info</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Added:</Text>
                    <Text>{new Date(selectedMovie.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Экран управления жанрами
  if (currentScreen === 'genres') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('main')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎭 Manage Genres</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              resetGenreForm();
              setShowGenreModal(true);
            }}
          >
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={genres}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.genreItem}>
              <Text style={styles.genreName}>{item.name}</Text>
              <View style={styles.genreActions}>
                <TouchableOpacity
                  style={styles.genreAction}
                  onPress={() => {
                    setEditingGenre(item);
                    setGenreName(item.name);
                    setShowGenreModal(true);
                  }}
                >
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.genreAction}
                  onPress={() => deleteGenre(index)}
                >
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Модальное окно для жанра */}
        <Modal
          visible={showGenreModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {editingGenre ? '✏️ Edit Genre' : '➕ New Genre'}
              </Text>
              
              <TextInput
                style={styles.modalInput}
                value={genreName}
                onChangeText={setGenreName}
                placeholder="Enter genre name"
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowGenreModal(false);
                    resetGenreForm();
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveModalButton]}
                  onPress={saveGenre}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6200ee',
  },
  movieCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  movieGenre: {
    color: '#6200ee',
    fontSize: 14,
    marginTop: 2,
  },
  movieMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  movieRating: {
    color: '#ffaa00',
    marginRight: 12,
  },
  movieDirector: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    backgroundColor: '#6200ee',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 16,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  genreOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  genreOptionActive: {
    backgroundColor: '#6200ee',
  },
  genreOptionTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailContainer: {
    flex: 1,
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailGenreBadge: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailGenre: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#666',
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  genreName: {
    fontSize: 16,
  },
  genreActions: {
    flexDirection: 'row',
  },
  genreAction: {
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveModalButton: {
    backgroundColor: '#6200ee',
  },
});