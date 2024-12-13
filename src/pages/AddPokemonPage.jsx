import React, { useState, useEffect, useRef } from "react";
import "../styling/AddPokemonPage.css";
import { Link } from "react-router-dom";
import { BACKEND } from "../global";

const AddPokemonPage = () => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [stats, setStats] = useState({
        hp: "",
        attack: "",
        defense: "",
        special_attack: "",
        special_defense: "",
        speed: "",
    });
    const [moves, setMoves] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [moveResults, setMoveResults] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [speciesQuery, setSpeciesQuery] = useState("");
    const [speciesResults, setSpeciesResults] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [image, setImage] = useState(null);

    const speciesInputRef = useRef(null);
    const movesInputRef = useRef(null);

    useEffect(() => {
        fetch(`${BACKEND}/types`)
            .then((response) => response.json())
            .then((data) => setTypeOptions(data))
            .catch((error) => console.error("Error fetching types:", error));
    }, []);

    useEffect(() => {
        if (speciesQuery.trim() === "") {
            setSpeciesResults([]);
            return;
        }

        fetch(`${BACKEND}/species`)
            .then((response) => response.json())
            .then((data) => {
                const filteredSpecies = data.filter((species) =>
                    species.name.toLowerCase().includes(speciesQuery.toLowerCase())
                );
                setSpeciesResults(filteredSpecies);
            })
            .catch((error) => console.error("Error fetching species:", error));
    }, [speciesQuery]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setMoveResults([]);
            return;
        }

        fetch(`${BACKEND}/moves`)
            .then((response) => response.json())
            .then((data) => {
                const filteredMoves = data.filter((move) =>
                    move.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setMoveResults(filteredMoves);
            })
            .catch((error) => console.error("Error fetching moves:", error));
    }, [searchQuery]);

    const handleTypeClick = (type) => {
        if (selectedTypes.includes(type.id)) {
            setSelectedTypes(selectedTypes.filter((selectedType) => selectedType !== type.id));
        } else if (selectedTypes.length < 2) {
            setSelectedTypes([...selectedTypes, type.id]);
        }
    };

    const handleStatChange = (e) => {
        const { name, value } = e.target;
        setStats((prevStats) => ({ ...prevStats, [name]: value }));
    };

    const handleMoveSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleMoveSelect = (move) => {
        if (!moves.some((m) => m.id === move.id)) {
            setMoves([...moves, move]);
        }
        setSearchQuery("");
        setMoveResults([]);
    };

    const handleSpeciesSearchChange = (e) => {
        setSpeciesQuery(e.target.value);
    };

    const handleSpeciesSelect = (species) => {
        setSelectedSpecies(species);
        setSpeciesQuery("");
        setSpeciesResults([]);
    };

    const handleClearSpecies = () => {
        setSelectedSpecies(null);
    };

    const removeMove = (move) => {
        setMoves(moves.filter((m) => m.id !== move.id));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newPokemon = {
            pokemon_name: document.getElementById("pokemon_name").value.trim(),
            species_id: selectedSpecies?.id || null,
            height: 10,
            weight: 10,
            type: selectedTypes || [],
            moves: moves.map((move) => move.id) || [],
            stats: {
                hp: parseInt(stats.hp) || 0,
                attack: parseInt(stats.attack) || 0,
                defense: parseInt(stats.defense) || 0,
                special_attack: parseInt(stats.special_attack) || 0,
                special_defense: parseInt(stats.special_defense) || 0,
                speed: parseInt(stats.speed) || 0,
            },
        };

        const payload = {
            pokemons: [newPokemon],
        };

        try {
            const pokemonResponse = await fetch(`${BACKEND}/pokemon`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!pokemonResponse.ok) {
                throw new Error("Failed to add Pokemon");
            }

            if (image) {
                const formData = new FormData();
                formData.append("image", image);

                const uploadResponse = await fetch("http://18.223.252.37:8000/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Image upload failed.");
                }
            }

            alert("Pokemon added successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while adding the Pokemon.");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                speciesInputRef.current &&
                !speciesInputRef.current.contains(event.target)
            ) {
                setSpeciesQuery("");
                setSpeciesResults([]);
            }

            if (
                movesInputRef.current &&
                !movesInputRef.current.contains(event.target)
            ) {
                setSearchQuery("");
                setMoveResults([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

            <div className="main-add-screen form-screen">
                <Link to="/search" className="back-link">
                    &larr; Back to Search
                </Link>

                <div className="form-container">
                    <h1 className="form-title">Add Newly Discovered Pokemon</h1>
                    <form className="custom-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="pokemon_name">Name</label>
                            <input
                                type="text"
                                id="pokemon_name"
                                className="add-pokemon-input"
                                placeholder="Enter Pokémon's name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="species">Species</label>
                            <div className="add-species-container" ref={speciesInputRef}>
                                {selectedSpecies ? (
                                    <div className="selected-species-display">
                                        <span>{selectedSpecies.name}</span>
                                        <button
                                            className="clear-species-button"
                                            onClick={handleClearSpecies}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        id="species"
                                        className="add-pokemon-input"
                                        placeholder="Search and select species"
                                        value={speciesQuery}
                                        onChange={handleSpeciesSearchChange}
                                    />
                                )}
                                {speciesResults.length > 0 && !selectedSpecies && (
                                    <ul className="species-results-dropdown">
                                        {speciesResults.map((species) => (
                                            <li
                                                key={species.id}
                                                className="species-result-item"
                                                onClick={() => handleSpeciesSelect(species)}
                                            >
                                                {species.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Moves</label>
                            <div className="add-moves-container" ref={movesInputRef}>
                                <input
                                    type="text"
                                    className="add-move-input"
                                    placeholder="Search and select moves"
                                    value={searchQuery}
                                    onChange={handleMoveSearchChange}
                                />
                                {moveResults.length > 0 && (
                                    <div className="move-results-dropdown">
                                        {moveResults.map((move) => (
                                            <div
                                                key={move.id}
                                                className="move-result-item"
                                                onClick={() => handleMoveSelect(move)}
                                            >
                                                {move.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <ul className="add-moves-list">
                                {moves.map((move) => (
                                    <li key={move.id} className="add-move-item">
                                        {move.name}
                                        <button
                                            type="button"
                                            className="remove-move-button"
                                            onClick={() => removeMove(move)}
                                        >
                                            ✖
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="form-group">
                            <label>Type(s)</label>
                            <div className="type-buttons">
                                {typeOptions.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`type-button ${selectedTypes.includes(type.id) ? "active" : ""}`}
                                        style={{ backgroundColor: type.color }}
                                        onClick={() => handleTypeClick(type)}
                                    >
                                        {type.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Stats</label>
                            <div className="add-stat-input-group">
                                {Object.keys(stats).map((stat) => {
                                    const formattedStat = stat
                                        .split('_')
                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');

                                    return (
                                        <div key={stat} className="add-stat-item">
                                            <label className="add-stat-label">{formattedStat}</label>
                                            <input
                                                type="number"
                                                name={stat}
                                                className="add-stat-input"
                                                value={stats[stat]}
                                                onChange={handleStatChange}
                                                placeholder={`Enter value`}
                                                required
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="pokemon_image">Upload Image (Optional)</label>
                            <input
                                type="file"
                                id="pokemon_image"
                                accept="image/*"
                                className="add-pokemon-input"
                                onChange={handleImageChange}
                            />
                        </div>

                        <button type="submit" className="submit-button">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddPokemonPage;