<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Board;
use App\Models\ProjectColumn;
use App\Models\Card;
use App\Models\Label;
use App\Models\Comment;
use App\Models\Invitation;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $alex = User::create(['name' => 'Alexandre', 'email' => 'alex@protask.dev', 'password' => 'pass123']);
        $sophie = User::create(['name' => 'Sophie', 'email' => 'sophie@protask.dev', 'password' => 'pass123']);
        $marc = User::create(['name' => 'Marc', 'email' => 'marc@protask.dev', 'password' => 'pass123']);

        $board1 = Board::create([
            'title' => 'Design System', 'owner_id' => 1,
            'description' => "Design system de l'application",
            'color' => '#8B5CF6', 'categories' => ['Design', 'UI/UX'],
            'member_ids' => [2, 3],
        ]);
        $b1backlog = ProjectColumn::create(['title' => 'Backlog', 'order_column' => 0, 'board_id' => 1, 'color' => '#6B7280', 'description' => 'Tâches en attente de traitement']);
        $b1encours = ProjectColumn::create(['title' => 'En cours', 'order_column' => 1, 'board_id' => 1, 'color' => '#3B82F6', 'description' => 'Tâches en cours de développement']);
        $b1termine = ProjectColumn::create(['title' => 'Terminé', 'order_column' => 2, 'board_id' => 1, 'color' => '#10B981', 'description' => 'Tâches terminées et validées']);

        $board2 = Board::create([
            'title' => 'Refonte App Mobile', 'owner_id' => 1,
            'description' => "Refonte complète de l'application mobile",
            'color' => '#3B82F6', 'categories' => ['Mobile'], 'member_ids' => [],
        ]);
        $b2todo = ProjectColumn::create(['title' => 'À faire', 'order_column' => 0, 'board_id' => 2, 'color' => '#F59E0B', 'description' => 'Tâches planifiées']);
        $b2encours = ProjectColumn::create(['title' => 'En cours', 'order_column' => 1, 'board_id' => 2, 'color' => '#3B82F6', 'description' => '']);
        $b2termine = ProjectColumn::create(['title' => 'Terminé', 'order_column' => 2, 'board_id' => 2, 'color' => '#10B981', 'description' => '']);

        $board3 = Board::create([
            'title' => 'Marketing Q2', 'owner_id' => 2,
            'description' => 'Stratégie marketing pour le Q2',
            'color' => '#EF4444', 'categories' => ['Marketing'], 'member_ids' => [3],
        ]);
        $b3idees = ProjectColumn::create(['title' => 'Idées', 'order_column' => 0, 'board_id' => 3, 'color' => '#8B5CF6', 'description' => 'Idées à explorer']);
        $b3prod = ProjectColumn::create(['title' => 'En production', 'order_column' => 1, 'board_id' => 3, 'color' => '#EF4444', 'description' => 'Campagnes en cours']);

        $l1 = Label::create(['name' => 'Design', 'color' => '#8B5CF6', 'board_id' => 1, 'description' => 'Design']);
        $l2 = Label::create(['name' => 'Dev', 'color' => '#3B82F6', 'board_id' => 1, 'description' => 'Dev']);
        $l3 = Label::create(['name' => 'Documentation', 'color' => '#10B981', 'board_id' => 1, 'description' => 'Doc']);
        $l4 = Label::create(['name' => 'Urgent', 'color' => '#EF4444', 'board_id' => 1, 'description' => 'Urgent']);

        Card::create(['title' => "Définir la palette", 'description' => "Choisir les couleurs primaires et secondaires.", 'order_column' => 0, 'column_id' => 1, 'due_date' => '2025-04-15', 'assignee_id' => 1, 'label_ids' => [1]]);
        Card::create(['title' => 'Composants UI', 'description' => "Créer les composants Button, Input, Card, Modal.", 'order_column' => 1, 'column_id' => 1, 'due_date' => '2025-04-20', 'assignee_id' => 2, 'label_ids' => [1, 2]]);
        Card::create(['title' => "Page accueil responsive", 'description' => "Terminer la mise en page responsive.", 'order_column' => 0, 'column_id' => 2, 'due_date' => '2025-04-10', 'assignee_id' => 1, 'label_ids' => [2]]);
        Card::create(['title' => 'Documentation', 'description' => "Écrire la documentation du design system.", 'order_column' => 1, 'column_id' => 3, 'due_date' => '2025-04-05', 'assignee_id' => 2, 'label_ids' => [3]]);
        Card::create(['title' => 'Wireframes', 'description' => "Wireframes validés par le client.", 'order_column' => 0, 'column_id' => 4, 'due_date' => '2025-04-08', 'assignee_id' => 1, 'label_ids' => [2]]);
        Card::create(['title' => 'Maquette Figma', 'description' => "Maquette haute-fidélité.", 'order_column' => 0, 'column_id' => 5, 'due_date' => '2025-04-18', 'assignee_id' => 1, 'label_ids' => [1]]);
        Card::create(['title' => "Tests utilisateurs", 'description' => "Session de tests utilisateurs.", 'order_column' => 0, 'column_id' => 6, 'due_date' => '2025-04-12', 'assignee_id' => 2, 'label_ids' => [3]]);
        Card::create(['title' => 'Analyse concurrents', 'description' => "Analyse des concurrents directs.", 'order_column' => 0, 'column_id' => 7, 'due_date' => '2025-04-14', 'assignee_id' => 1, 'label_ids' => [2]]);
        Card::create(['title' => 'Stratégie contenu', 'description' => "Plan de contenu pour les réseaux sociaux.", 'order_column' => 1, 'column_id' => 7, 'due_date' => '2025-04-22', 'assignee_id' => 2, 'label_ids' => [1, 4]]);
        Card::create(['title' => 'Campagne emailing', 'description' => "Campagne emailing Q2.", 'order_column' => 0, 'column_id' => 8, 'due_date' => '2025-04-25', 'assignee_id' => 1, 'label_ids' => [4]]);

        Comment::create(['text' => "J'ai commencé la palette.", 'author_id' => 1, 'card_id' => 1]);
        Comment::create(['text' => "Je valide le violet.", 'author_id' => 2, 'card_id' => 1]);
        Comment::create(['text' => 'PR créé.', 'author_id' => 1, 'card_id' => 3]);
        Comment::create(['text' => "J'ai ajouté les variantes disabled et loading.", 'author_id' => 2, 'card_id' => 2]);
        Comment::create(['text' => "Review faite, quelques suggestions.", 'author_id' => 1, 'card_id' => 2]);

        Invitation::create(['board_id' => 1, 'email' => 'marc@protask.dev', 'invited_by_id' => 1, 'status' => 'accepted']);
        Invitation::create(['board_id' => 1, 'email' => 'julie@test.com', 'invited_by_id' => 1, 'status' => 'pending']);
    }
}
