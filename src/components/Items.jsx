import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Items() {
    const [items, setItems] = useState([]);

    const itemNameRef = useRef(null);
    const itemCategoryRef = useRef(null);
    const itemPriceRef = useRef(null);

    useEffect(() => {
        let active = true;

        const fetchItems = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/item");
                const data = await response.json();
                if (active) setItems(data);
            } catch {
                alert("Loading items failed");
            }
        };

        fetchItems();

        return () => {
            active = false;
        };
    }, []);

    const onItemSave = async () => {
        const body = {
            itemName: itemNameRef.current.value,
            itemCategory: itemCategoryRef.current.value,
            itemPrice: itemPriceRef.current.value,
        };

        const result = await fetch("http://localhost:3000/api/item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (result.ok) {
            itemNameRef.current.value = "";
            itemPriceRef.current.value = "";

            const response = await fetch("http://localhost:3000/api/item");
            const data = await response.json();
            setItems(data);
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm("Delete this item?")) return;

        const result = await fetch(
            `http://localhost:3000/api/item/${id}`,
            { method: "DELETE" }
        );

        if (result.ok) {
            const response = await fetch("http://localhost:3000/api/item");
            const data = await response.json();
            setItems(data);
        } else {
            alert("Delete failed");
        }
    };

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item._id}>
                        <td>{item._id}</td>
                        <td>{item.itemName}</td>
                        <td>{item.itemCategory}</td>
                        <td>{item.itemPrice}</td>
                        <td>
                            <Link to={`/items/${item._id}`}>Edit</Link>
                            {" | "}
                            <button onClick={() => onDelete(item._id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                <tr>
                    <td>-</td>
                    <td><input ref={itemNameRef} /></td>
                    <td>
                        <select ref={itemCategoryRef}>
                            <option>Stationary</option>
                            <option>Kitchenware</option>
                            <option>Appliance</option>
                        </select>
                    </td>
                    <td><input ref={itemPriceRef} /></td>
                    <td>
                        <button onClick={onItemSave}>Add Item</button>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
