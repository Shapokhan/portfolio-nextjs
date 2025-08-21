import Image from 'next/image';
import { Card, CardContent, CardFooter, CardTitle } from '../../ui/card';
import { Badge } from 'lucide-react';

const popularContent = [
  {
    id: 1,
    title: 'JavaScript Tutorial',
    badge: 'Coding',
    imageUrl:
      'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 4300,
  },
  {
    id: 2,
    title: 'Tech Trends 2025',
    badge: 'Tech',
    imageUrl:
      'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 3200,
  },
  {
    id: 3,
    title: 'The Future of AI',
    badge: 'AI',
    imageUrl:
      'https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 2400,
  },
  {
    id: 4,
    title: 'React Hooks Explained',
    badge: 'Coding',
    imageUrl:
      'https://images.pexels.com/photos/943096/pexels-photo-943096.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 1500,
  },
  {
    id: 5,
    title: 'Image Generation with AI',
    badge: 'AI',
    imageUrl:
      'https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 1200,
  },
];

const latestTransactions = [
  {
    id: 1,
    title: 'Subscription Renewal',
    badge: 'John Doe',
    imageUrl:
      'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 1400,
  },
  {
    id: 2,
    title: 'Payment for Services',
    badge: 'Jane Smith',
    imageUrl:
      'https://images.pexels.com/photos/4969918/pexels-photo-4969918.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 2100,
  },
  {
    id: 3,
    title: 'Subscription Renewal',
    badge: 'Michael Johnson',
    imageUrl:
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 1300,
  },
  {
    id: 4,
    title: 'Payment for Services',
    badge: 'Lily Adams',
    imageUrl:
      'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 2500,
  },
  {
    id: 5,
    title: 'Subscription Renewal',
    badge: 'Sam Brown',
    imageUrl:
      'https://images.pexels.com/photos/1680175/pexels-photo-1680175.jpeg?auto=compress&cs=tinysrgb&w=800',
    count: 1400,
  },
];

export default function CardList({ title }: { title: string }) {
  const list =
    title === 'Popular Content' ? popularContent : latestTransactions;
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>

      <div className="flex flex-col gap-2">
        {list.map((item) => (
          <Card
            key={item.id}
            className="flex-row items-center justify-between gap-4 p-4"
          >
            <div className="w-12 h-12 rounded-sm relative overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="flex-1 p-0">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Badge>{item.badge}</Badge>
            </CardContent>
            <CardFooter className="p-0">{item.count / 1000}K</CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
