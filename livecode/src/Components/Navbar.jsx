import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBars } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

const Navbar =()=> {
  return (

        <nav className="navbar navbar-expand-lg navbar-dark " style={{ backgroundColor: '#41b9a5' }}>
          <div className="container-fluid">
            <a className="navbar-brand" href="/"><img src="/kode.svg" style={{width:"50%"}} alt="" /></a>
           
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="collapse navbar-collapse " id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
            <form className="w-auto " style={{marginLeft:'60%'}}>
                <input type="search" className="form-control" placeholder="Type query" aria-label="Search" />
              </form>
              <ul className="navbar-nav d-flex flex-row me-1">

                <li className="nav-item  me-lg-0">
                <a className="navbar-brand" href="https://www.linkedin.com/in/kamalnath-vijayavel-018b00203/" > <img src="https://img.icons8.com/?size=100&id=8808&format=png&color=FFFFFF" alt="linkedin" style={{width:"30%"}}/></a>

                </li>
              </ul>

            </div>
          </div>
        </nav>

  )
}

export default Navbar
