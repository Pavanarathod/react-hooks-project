import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Infobox from "./Infobox";
import Map from "./Map";
import Table from "./Table";
import "./App.css";
import { prettyPrintStat, sortData } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

// https://disease.sh/v3/covid-19/continents
function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  // use effect for another api
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);
  const onCountryChange = async (event) => {
    const countrycode = event.target.value;
    setCountry(countrycode);

    const url =
      countrycode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : "https://disease.sh/v3/covid-19/countries/" + countrycode;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countrycode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  // console.log(">>>>>>>>>Info", countryInfo);

  // console.log(countries);

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide </MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}> {country.name} </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <Infobox
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <Infobox
            active={casesType === "recoverede"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <Infobox
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h2>Live Cases by Country</h2>
          <Table countries={tableData} />
          <h2>Worldwide New {casesType}</h2>
          <LineGraph casesType={casesType} />
        </CardContent>

        {/* graph */}
      </Card>
    </div>
  );
}

export default App;
