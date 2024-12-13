import React, { useState, useEffect } from 'react';
import '../styling/SearchPage.css';
import { Link } from 'react-router-dom';
import { BACKEND } from '../global';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredType, setFilteredType] = useState('');
    const [pokemons, setPokemons] = useState([]);
    const [typeFilters, setTypeFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Pokémon data from the backend
    useEffect(() => {
        const fetchPokemons = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND}/pokemon`);
                if (!response.ok) {
                    throw new Error('Failed to fetch Pokémon data');
                }
                const data = await response.json();
                setPokemons(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPokemons();
    }, []);

    // Fetch type filters from the backend
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch(`http://localhost:8000/types`);
                if (!response.ok) {
                    throw new Error('Failed to fetch types');
                }
                const types = await response.json();
                setTypeFilters(types);
            } catch (err) {
                console.error('Error fetching types:', err);
            }
        };

        fetchTypes();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterClick = (type) => {
        setFilteredType(type === filteredType ? '' : type);
    };

    // Filter Pokémon based on search term and selected type
    const filteredPokemons = pokemons.filter((pokemon) => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filteredType ? pokemon.type.some((t) => t.name === filteredType) : true;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return <p>Loading Pokémon...</p>;
    }

    if (error) {
        return <p>Error loading Pokémon: {error}</p>;
    }

    return (
        <>
            <header className="header">
                <Link to="/add" className="blue-circle"></Link>
                <div className="top-left"></div>
                <div className="top-right"></div>
                <div className="middle">
                    <div className="middle-left"></div>
                    <div className="diagonal"></div>
                    <div className="middle-right"></div>
                </div>
            </header>

            <div className="search-main-area">
                <input
                    type="text"
                    placeholder="Search Pokémon..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                />

                <div className="filters-and-results">
                    <div className="left-filter-container">
                        <div className="main-filter-screen">
                            <div className="filter-buttons-column">
                                <div className="filter-buttons-grid">
                                    {typeFilters.map((type) => (
                                        <button
                                            key={type.id}
                                            className={`filter-button ${filteredType === type.name ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: type.color,
                                                boxShadow: filteredType === type.name ? 'inset 0 0 0 2px black' : 'none',
                                            }}
                                            onClick={() => handleFilterClick(type.name)}
                                        >
                                            {type.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="main-list-screen">
                        {filteredPokemons.length > 0 ? (
                            filteredPokemons.map((pokemon) => (
                                <Link to={`/profile/${pokemon.id}`} key={pokemon.id} className="pokemon-item">
                                    <div className="pokemon-item-details">
                                        <p className="pokemon-name">{pokemon.name}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-results">No Pokémon found.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchPage;