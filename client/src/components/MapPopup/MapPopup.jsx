import React from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import "./MapPopup.css";
import findLocation from "../../assets/find-location.png";

const MapPopup = ({ isOpen, lat, lon, postArea, onClose }) => {
  if (!isOpen) return null;

  const handleDirectionsClick = () => {
    // 카카오 길찾기 URL 생성
    const directionsURL = `https://map.kakao.com/link/to/${postArea},${lat},${lon}`;

    // 새 창 열기
    window.open(directionsURL, "_blank");
  };

  return (
    <div className="map_background">
      <div className="map-popup">
        <button className="map-popup-close" onClick={onClose}>
          ×
        </button>
        <div className="map-popup-content">
          <Map className="map" center={{ lat, lng: lon }} level={3}>
            <MapMarker position={{ lat, lng: lon }} />
          </Map>
          <div className="post-information">
            <div className="postArea">{postArea}</div>
            <div className="findLocation-container">
              <img
                src={findLocation}
                className="findLocation"
                alt="Directions"
                onClick={handleDirectionsClick}
              />
              <p className="findLocation-text">길찾기</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPopup;
