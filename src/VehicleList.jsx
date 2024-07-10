import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { format } from "date-fns";
import React, { useEffect, useState } from 'react';



const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [models, setModels] = useState([]);
    const [sortDirection, setSortDirection] = useState('asc');

    const [newVehicle, setNewVehicle] = useState({
        tuition: '',
        modelId: 0,
        annio: '2024',
        color: ''
    });

    const fetchAllVehicles = () => {
        setSearchTerm("");
        fetchVehicles(currentPage - 1, "");
    }

    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            fetchVehicles(currentPage - 1, searchTerm);
        }, 500);

        return () => clearTimeout(searchTimeout);
    }, [searchTerm, currentPage]);

    const fetchVehicles = (page, searchTerm) => {
        setLoading(true);
        axios.get(`http://localhost:8080/vehicle/findAllCustom?page=${page}&size=10&sort=id&sortDir=${sortDirection}&value=${searchTerm}`)
            .then(response => {
                setVehicles(response.data.data.listVehicleViewDTOS);
                setTotalPages(response.data.data.page);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
    };

    const handleDeleteVehicle = (id) => {
        let confir = confirm("¿Are you sure you want to continue?");
        if (confir) {
            axios.delete(`http://localhost:8080/vehicle/${id}`)
                .then(response => {
                    setNewVehicle(response.data.data);
                    setLoading(false);
                    fetchVehicles(0, "");
                })
                .catch(error => {
                    console.error(error);
                    setLoading(false);
                });
        }
    };

    const handleUpdateVehicle = (id) => {
        axios.get(`http://localhost:8080/vehicle/${id}`)
            .then(response => {
                setNewVehicle(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
        setShowModal(true);
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleCreateVehicle = () => {
        setNewVehicle((prevState) => ({ ...prevState, id: '' }));
        setNewVehicle((prevState) => ({ ...prevState, tuition: '' }));
        setNewVehicle((prevState) => ({ ...prevState, modelId: '' }));
        setNewVehicle((prevState) => ({ ...prevState, annio: '2024' }));
        setNewVehicle((prevState) => ({ ...prevState, color: '' }));
        setShowModal(true);
    };

    const handleSaveVehicle = async (e) => {
        e.preventDefault();
        setShowModal(false);
        const url = "http://localhost:8080/vehicle/";
        let response
        try {
            if (newVehicle.id !== '' && newVehicle.id > 0) {
                response = await axios.put(url + newVehicle.id, newVehicle);
                showAlert('Vehicle updated successfully!', 'success', 3000);
            } else {
                response = await axios.post(url, newVehicle);
                showAlert('Vehicle created successfully!', 'success', 3000);
            }
            fetchVehicles(0, "");

        } catch (error) {
            console.error(error);
            const code = error.request.status;
            if (code === 409) {
                showAlert('Error Duplicate registration!', 'error', 3000);
            } else if (code === 400) {
                showAlert('Error There are fields that are required!', 'error', 3000);
            } else if (code === 404) {
                showAlert('Error Model not found!', 'error', 3000);
            } else {
                showAlert('Error  processing request!', 'error', 3000);
            }
        }
    };
    const showAlert = (message, type, duration) => {
        const alert = document.createElement('div');
        alert.classList.add('alert', type);
        alert.textContent = message;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.classList.add('hide');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, duration);
    };
    const handleInputChange = (event) => {
        setNewVehicle({
            ...newVehicle,
            [event.target.name]: event.target.value
        });
    };

    const fetchModels = () => {
        axios.get('http://localhost:8080/model/vehicle')
            .then(response => {
                const models = response.data.data.map(model => ({ value: model.id, brand: model.nameBrand, model: model.nameModel }));
                setModels(models);
            })
            .catch(error => {
                console.error(error);
            });
    };


    useEffect(() => {
        fetchModels();
    }, []);
    const getCurrentYear = () => {
        return new Date().getFullYear();
    };

    const getYearOptions = () => {
        const currentYear = getCurrentYear();
        const options = [];

        for (let year = currentYear; year >= 1980; year--) {
            options.push(
                <option key={year} value={year}>
                    {year}
                </option>
            );
        }

        return options;
    };

    return (
        <div className="container my-5 d-flex justify-content-center">
            <div className="w-100">
                <h1 className="text-2xl font-bold mb-4">Vehicles</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search vehicles..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                {loading ? (
                    <div className="d-flex justify-content-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="table-responsive">
                            <button className="btn btn-success btn-sm" style={{ float: 'right' }} onClick={handleCreateVehicle}>
                                Create
                            </button>
                            <button className="btn btn-info btn-sm" style={{ float: 'right' }} onClick={fetchAllVehicles}>
                                All View
                            </button>
                            <label htmlFor="sort-direction">Sort Direction:</label>
                            <select className='form-control' style={{ width: '150px' }} id="sort-direction" name='sort-direction'
                                value={sortDirection}
                                onChange={(event) => setSortDirection(event.target.value)}>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col">Tuition</th>
                                        <th scope="col">Brand</th>
                                        <th scope="col">Model</th>
                                        <th scope="col">Color</th>
                                        <th scope="col">Year</th>
                                        <th scope="col">Created</th>
                                        <th scope="col">updated</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map(vehicle => (
                                        <tr key={vehicle.id}>
                                            <td>{vehicle.tuition}</td>
                                            <td>{vehicle.nameBrand}</td>
                                            <td>{vehicle.nameModel}</td>
                                            <td><span style={{ background: vehicle.color }}>{vehicle.color}</span></td>
                                            <td>{vehicle.annio}</td>
                                            <td><span>{vehicle.createdAt === null ? '-----' : format(vehicle.createdAt, "dd-MM-yyyy hh:mm:ss")}</span></td>
                                            <td><span>{vehicle.updatedAt === null ? '-----' : format(vehicle.updatedAt, "dd-MM-yyyy hh:mm:ss")}</span></td>
                                            <td>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleUpdateVehicle(vehicle.id)}>
                                                    Update
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteVehicle(vehicle.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex justify-content-center mt-4">
                            <nav aria-label="Page navigation">
                                <ul className="pagination">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(page)}>
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
                {showModal && (
                    <div className="modal d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Create Vehicle</h5>
                                </div>
                                <div className="modal-body">
                                    <label >*Required input</label>
                                    <br></br><br></br>
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="tuition">*Tuition</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="tuition"
                                                name="tuition"
                                                value={newVehicle.tuition} style={{ textTransform: 'uppercase' }}
                                                maxLength={20}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="model">*Brand-Model</label>
                                            <select
                                                className="form-select"
                                                id="model"
                                                name="modelId"
                                                value={newVehicle.modelId}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Model</option>
                                                {models.map(model => (
                                                    <option key={model.value} value={model.value}>
                                                        {model.brand} {model.model}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="annio">*Year</label>
                                            <select className="form-select"
                                                id="annio"
                                                name="annio"
                                                value={newVehicle.annio}
                                                onChange={handleInputChange}
                                            >
                                                {getYearOptions()}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="color">Color:</label>
                                            <select
                                                className="form-control"
                                                id="color"
                                                name="color"
                                                value={newVehicle.color}
                                                onChange={handleInputChange}
                                                style={{
                                                    backgroundImage: `linear-gradient(45deg, transparent 50%, ${newVehicle.color} 50%),
                                                    linear-gradient(135deg, ${newVehicle.color} 50%, transparent 50%),
                                                    linear-gradient(to right, ${newVehicle.color}, ${newVehicle.color})`,
                                                    backgroundPosition: `calc(100% - 20px) calc(1em + 2px),
                                                    calc(100% - 15px) calc(1em + 2px),
                                                    calc(100% - 2.5em) 0.5em`,
                                                    backgroundSize: `5px 5px,
                                                5px 5px,
                                                1px 1.5em`,
                                                    backgroundRepeat: 'no-repeat',
                                                }}
                                            >
                                                <option value="">Select color</option>
                                                <option value="red">red</option>
                                                <option value="green">green</option>
                                                <option value="blue">blue</option>
                                                <option value="yellow">yellow</option>
                                                <option value="black">black</option>
                                                <option value="white">white</option>
                                                <option value="orange">orange</option>
                                                <option value="purple">purple</option>
                                                <option value="pink">pink</option>
                                                <option value="brown">brown</option>
                                                <option value="gray">gray</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Close
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={handleSaveVehicle}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default VehicleList;