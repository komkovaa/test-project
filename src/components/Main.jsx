import { useCallback, useEffect, useState } from 'react';
import { EmptyState, RoundIcon, Search, Table } from 'vienna-ui';
import { CloseCancelX, Search16 } from 'vienna.icons';
import '../style/Main.css';

export default function Main() {
  const [cakes, setCakes] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [suggests, setSuggests] = useState();
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e, data) => {
    const mock = [
      'Raspberry and custard muffins',
      'Lemon and blackberry stripe cake',
      'Paul Hollywood’s chocolate fudge cake',
      'Lemon and strawberry meringue cake'
    ];
    const regexp = new RegExp(`^${encodeURI(data.value.toUpperCase())}`);
    const temp = (data.value && mock.filter((m) => regexp.test(encodeURI(m.toUpperCase())))) || [];
    setSuggests(temp);
    setSearchValue(data.value);
  }, []);

  const search = cakes.filter((item) => item.title.includes(searchValue))

  const handleSelect = useCallback((e, data) => {
    setSearchValue(data.value);
  }, []);

  const getCakeList = () => {
    setLoading(true);
    return fetch('https://the-birthday-cake-db.p.rapidapi.com/', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '0aee4d18famsh9182676098fd8b6p1acd11jsn7f30fb446a80',
        'x-rapidapi-host': 'the-birthday-cake-db.p.rapidapi.com'
      }
    })
      .then(response => response.json()).then(json => {
        setLoading(false);
        setCakes(json)
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  }

  const onSort = (e, { field, direction }) => {
    const dir = direction === 'desc' ? 1 : -1;
    if (field) {
      let newData = [...cakes].sort(function (a, b) {
        let nameA = a[field].toUpperCase();
        let nameB = b[field].toUpperCase();
        let result = nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        return result * dir;
      });
      setCakes(newData);
    }
  };

  useEffect(() => {
    getCakeList()
  }, []);

  return (
    <div className="main-wrapper">
      <h1>The Birthday Cake</h1>
      <Search
        className="search-input"
        prefix={<Search16 />}
        suggests={suggests}
        value={searchValue}
        placeholder='Search by title'
        onChange={handleChange}
        onSelect={handleSelect}
      />
      <Table data={searchValue ? search : cakes} size='m' marginTop='s5' onSort={onSort} noHeader={!cakes.length}>
        <Table.Column className="table-cell" id='id' title='#'>
          {(cake) => cake.id}
        </Table.Column>
        <Table.Column id='title' title='Title' sortable>
          {(cake) => cake.title}
        </Table.Column>
        <Table.Column id='difficulty' title='Difficulty' sortable>
          {(cake) => cake.difficulty}
        </Table.Column>
        <Table.Column id='image' title='Image'>
          {(cake) => (
            <img className="img-wrapper" src={cake.image} alt={cake.title} />
          )}
        </Table.Column>
        {loading && (<EmptyState loading>
          <EmptyState.Title>Загружаем данные</EmptyState.Title>
          <EmptyState.Description>Мы загружаем данные таблицы, очень скоро они будут готовы.</EmptyState.Description>
        </EmptyState>)}
        {!cakes.length && !loading && (<EmptyState>
          <RoundIcon color="nice10">
            <CloseCancelX />
          </RoundIcon>
          <EmptyState.Title>Ошибка загрузки данных</EmptyState.Title>
          <EmptyState.Description>Что-то пошло не так и мы уже работаем над этим.</EmptyState.Description>
        </EmptyState>)}
      </Table>

    </div>
  )
}
